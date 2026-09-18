import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_TOURNAMENTS, INITIAL_TEAMS, generateInitialSlots, INITIAL_LEADERBOARD, INITIAL_ADMIN_LOGS } from '../lib/seedData';
import { calculateMatchScore, sortLeaderboard } from '../lib/scoring';
import {
  seedFirestoreIfEmpty,
  subscribeToCollection,
  saveTournament,
  deleteTournamentFromDB,
  saveSlot,
  saveSlotsInBatch,
  saveTeam,
  saveLeaderboardEntry,
  saveLeaderboardBatch,
  saveMatch,
  saveAdminLog,
  CACHE,
} from '../lib/firestoreDB';
import {
  subscribeToRegistrations,
  saveRegistrationToFirebase,
  updateRegistrationStatusInFirebase,
} from '../lib/firebaseRegistration';

const TournamentContext = createContext(null);

// ─── Legacy localStorage keys (used for migration/fallback only) ──────────────
const LS_KEYS = {
  TOURNAMENTS: 'panthers_tournaments_v2',
  SLOTS:       'panthers_slots_v2',
  TEAMS:       'panthers_teams_v2',
  LEADERBOARD: 'panthers_leaderboard_v2',
  ADMIN_LOGS:  'panthers_admin_logs_v2',
  MATCHES:     'panthers_matches_v2',
};

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export const TournamentProvider = ({ children }) => {
  // ── State (initialized from Firestore cache or legacy localStorage) ──────────
  const [tournaments, setTournaments] = useState(() =>
    readLS(CACHE.TOURNAMENTS, readLS(LS_KEYS.TOURNAMENTS, INITIAL_TOURNAMENTS))
  );
  const [slots, setSlots] = useState(() =>
    readLS(CACHE.SLOTS, readLS(LS_KEYS.SLOTS, generateInitialSlots()))
  );
  const [teams, setTeams] = useState(() =>
    readLS(CACHE.TEAMS, readLS(LS_KEYS.TEAMS, INITIAL_TEAMS))
  );
  const [leaderboard, setLeaderboard] = useState(() =>
    readLS(CACHE.LEADERBOARD, readLS(LS_KEYS.LEADERBOARD, INITIAL_LEADERBOARD))
  );
  const [adminLogs, setAdminLogs] = useState(() =>
    readLS(CACHE.ADMIN_LOGS, readLS(LS_KEYS.ADMIN_LOGS, INITIAL_ADMIN_LOGS))
  );
  const [matches, setMatches] = useState(() =>
    readLS(CACHE.MATCHES, readLS(LS_KEYS.MATCHES, []))
  );
  const [registrations, setRegistrations] = useState([]);

  // Loading + sync state
  const [isLoading, setIsLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  // Cross-tab channel + in-flight booking guard
  const broadcastRef = useRef(null);
  const inFlightBookingsRef = useRef(new Set());

  // ── 1. Seed Firestore on first run, then subscribe to all collections ────────
  useEffect(() => {
    let mounted = true;

    const initFirestore = async () => {
      try {
        await seedFirestoreIfEmpty();
      } catch (err) {
        console.warn('[TournamentContext] Seed check failed (offline mode):', err.message);
        setSyncError('Offline — showing cached data.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initFirestore();

    // Subscribe to all collections
    const unsubTournaments = subscribeToCollection(
      'tournaments', CACHE.TOURNAMENTS,
      (data) => { if (mounted && data.length > 0) setTournaments(data); },
      []
    );
    const unsubSlots = subscribeToCollection(
      'slots', CACHE.SLOTS,
      (data) => {
        if (mounted && data.length > 0) {
          const sorted = [...data].sort((a, b) => a.slot_number - b.slot_number);
          setSlots(sorted);
        }
      },
      []
    );
    const unsubTeams = subscribeToCollection(
      'teams', CACHE.TEAMS,
      (data) => { if (mounted && data.length > 0) setTeams(data); },
      []
    );
    const unsubLeaderboard = subscribeToCollection(
      'leaderboard', CACHE.LEADERBOARD,
      (data) => { if (mounted) setLeaderboard(data); },
      []
    );
    const unsubAdminLogs = subscribeToCollection(
      'admin_logs', CACHE.ADMIN_LOGS,
      (data) => { if (mounted && data.length > 0) setAdminLogs(data); },
      []
    );
    const unsubMatches = subscribeToCollection(
      'matches', CACHE.MATCHES,
      (data) => { if (mounted) setMatches(data); },
      []
    );

    return () => {
      mounted = false;
      unsubTournaments();
      unsubSlots();
      unsubTeams();
      unsubLeaderboard();
      unsubAdminLogs();
      unsubMatches();
    };
  }, []);

  // ── 2. Firebase registration listener (UTR payments) ─────────────────────────
  useEffect(() => {
    const unsubscribe = subscribeToRegistrations((newRegs) => {
      setRegistrations(newRegs);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // ── 3. Cross-tab BroadcastChannel (instant local sync, no Firestore round-trip) ──
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('panthers_esports_realtime');
      broadcastRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SLOTS_UPDATED')       setSlots(payload);
        else if (type === 'TOURNAMENTS_UPDATED') setTournaments(payload);
        else if (type === 'LEADERBOARD_UPDATED') setLeaderboard(payload);
        else if (type === 'TEAMS_UPDATED')   setTeams(payload);
        else if (type === 'LOGS_UPDATED')    setAdminLogs(payload);
      };

      return () => channel.close();
    }
  }, []);

  const broadcast = (type, payload) => {
    broadcastRef.current?.postMessage({ type, payload });
  };

  // ─── Admin Log ──────────────────────────────────────────────────────────────
  const addAdminLog = useCallback((action, details, adminName = 'PantherAdmin') => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      admin_name: adminName,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    setAdminLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50);
      broadcast('LOGS_UPDATED', updated);
      return updated;
    });

    // Persist to Firestore
    saveAdminLog(newLog);
  }, []);

  // ==========================================
  // TOURNAMENT ACTIONS
  // ==========================================
  const createTournament = (data, adminName = 'PantherAdmin') => {
    const newId = `tourney-${Date.now()}`;
    const totalSlots = parseInt(data.total_slots, 10) || 12;

    const newTournament = {
      id: newId,
      name: data.name,
      description: data.description || '',
      banner_url: data.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      mode: data.mode || 'Squad',
      map: data.map || 'Bermuda',
      date: data.date,
      time: data.time,
      entry_fee: parseFloat(data.entry_fee) || 0,
      prize_pool: parseFloat(data.prize_pool) || 0,
      prize_distribution: data.prize_distribution || {
        '1st': `₹${Math.round(data.prize_pool * 0.5)}`,
        '2nd': `₹${Math.round(data.prize_pool * 0.3)}`,
        '3rd': `₹${Math.round(data.prize_pool * 0.2)}`,
      },
      total_slots: totalSlots,
      status: 'upcoming',
      room_id: data.room_id || null,
      room_password: data.room_password || null,
      rules: data.rules || 'Standard Free Fire competitive rules apply.',
      created_at: new Date().toISOString(),
    };

    const newSlots = Array.from({ length: totalSlots }, (_, i) => ({
      id: `slot-${newId}-${i + 1}`,
      tournament_id: newId,
      slot_number: i + 1,
      team_id: null,
      status: 'open',
      booked_at: null,
    }));

    setTournaments(prev => {
      const updated = [newTournament, ...prev];
      broadcast('TOURNAMENTS_UPDATED', updated);
      return updated;
    });
    setSlots(prev => {
      const updated = [...prev, ...newSlots];
      broadcast('SLOTS_UPDATED', updated);
      return updated;
    });

    // Persist to Firestore
    saveTournament(newTournament);
    saveSlotsInBatch(newSlots);

    addAdminLog('TOURNAMENT_CREATED', `Created "${newTournament.name}" with ${totalSlots} slots.`, adminName);
    return newTournament;
  };

  const updateTournament = (id, data, adminName = 'PantherAdmin') => {
    setTournaments(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t);
      broadcast('TOURNAMENTS_UPDATED', updated);
      const changedTournament = updated.find(t => t.id === id);
      if (changedTournament) saveTournament(changedTournament);
      return updated;
    });
    addAdminLog('TOURNAMENT_UPDATED', `Updated tournament details for ${id}.`, adminName);
  };

  const deleteTournament = (id, adminName = 'PantherAdmin') => {
    const t = tournaments.find(item => item.id === id);
    const slotsToDelete = slots.filter(s => s.tournament_id === id);

    setTournaments(prev => {
      const updated = prev.filter(item => item.id !== id);
      broadcast('TOURNAMENTS_UPDATED', updated);
      return updated;
    });
    setSlots(prev => {
      const updated = prev.filter(s => s.tournament_id !== id);
      broadcast('SLOTS_UPDATED', updated);
      return updated;
    });

    deleteTournamentFromDB(id);

    addAdminLog('TOURNAMENT_DELETED', `Deleted tournament "${t?.name || id}".`, adminName);
  };

  const updateTournamentRoom = (id, roomId, roomPassword, adminName = 'PantherAdmin') => {
    setTournaments(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, room_id: roomId, room_password: roomPassword } : t);
      broadcast('TOURNAMENTS_UPDATED', updated);
      const changed = updated.find(t => t.id === id);
      if (changed) saveTournament(changed);
      return updated;
    });
    addAdminLog('ROOM_CREDENTIALS_UPDATED', `Room ID & password updated for tournament ${id}.`, adminName);
  };

  const updateTournamentStatus = (id, status, adminName = 'PantherAdmin') => {
    setTournaments(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status } : t);
      broadcast('TOURNAMENTS_UPDATED', updated);
      const changed = updated.find(t => t.id === id);
      if (changed) saveTournament(changed);
      return updated;
    });
    addAdminLog('STATUS_CHANGED', `Changed tournament ${id} status to ${status.toUpperCase()}.`, adminName);
  };

  // ==========================================
  // SLOT BOOKING & MANAGEMENT
  // ==========================================
  const bookSlot = async (tournamentId, slotNumber, teamRegistrationData) => {
    const slotKey = `${tournamentId}-${slotNumber}`;
    if (inFlightBookingsRef.current.has(slotKey)) {
      return { success: false, error: 'Booking already in progress. Please wait a moment...' };
    }
    inFlightBookingsRef.current.add(slotKey);

    try {
      const targetSlot = slots.find(s => s.tournament_id === tournamentId && s.slot_number === slotNumber);
      if (!targetSlot) return { success: false, error: 'Slot does not exist.' };
      if (targetSlot.status !== 'open') return { success: false, error: `Slot #${slotNumber} is already taken!` };

      const existingTeamBooking = slots.find(
        s => s.tournament_id === tournamentId && s.team_id && s.team_id === teamRegistrationData.team_id
      );
      if (existingTeamBooking) {
        return { success: false, error: `Your team is already in Slot #${existingTeamBooking.slot_number}!` };
      }

      let registeredTeamId = teamRegistrationData.team_id;
      let newTeam = null;
      if (!registeredTeamId || !teams.find(t => t.id === registeredTeamId)) {
        registeredTeamId = `team-${Date.now()}`;
        newTeam = {
          id: registeredTeamId,
          name: teamRegistrationData.team_name,
          tag: teamRegistrationData.team_tag || teamRegistrationData.team_name.substring(0, 4).toUpperCase(),
          captain_user_id: teamRegistrationData.captain_user_id || null,
          captain_name: teamRegistrationData.captain_name,
          captain_phone: teamRegistrationData.captain_phone,
          captain_uid: teamRegistrationData.captain_uid,
          players: teamRegistrationData.players || [],
          payment: teamRegistrationData.payment || null,
          created_at: new Date().toISOString(),
        };

        setTeams(prev => {
          const updated = [...prev.filter(t => t.id !== newTeam.id), newTeam];
          broadcast('TEAMS_UPDATED', updated);
          return updated;
        });

        // Persist team to Firestore
        try {
          await saveTeam(newTeam);
        } catch (e) {
          console.warn('[TournamentContext] saveTeam note:', e.message);
        }
      }

      const bookedSlotData = {
        ...targetSlot,
        team_id: registeredTeamId,
        status: 'booked',
        booked_at: new Date().toISOString(),
      };

      setSlots(prev => {
        const updated = prev.map(s => {
          if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
            return bookedSlotData;
          }
          return s;
        }).sort((a, b) => a.slot_number - b.slot_number);

        broadcast('SLOTS_UPDATED', updated);
        return updated;
      });

      // Persist slot to Firestore
      try {
        await saveSlot(bookedSlotData);
      } catch (e) {
        console.warn('[TournamentContext] saveSlot note:', e.message);
      }

      // Save full registration (UTR) to Firebase
      const targetTourney = tournaments.find(t => t.id === tournamentId);
      try {
        await saveRegistrationToFirebase({
          ...teamRegistrationData,
          tournament_id: tournamentId,
          tournament_name: targetTourney?.name || 'Panthers Free Fire Tri-Map Series',
          slot_number: slotNumber,
          team_id: registeredTeamId,
        });
      } catch (err) {
        console.warn('[TournamentContext] saveRegistrationToFirebase note:', err.message);
      }

      addAdminLog(
        'SLOT_BOOKED',
        `Slot #${slotNumber} secured by "${teamRegistrationData.team_name}" (UTR: ${teamRegistrationData.payment?.utr || 'Pending'}).`,
        teamRegistrationData.captain_name || 'Player'
      );

      return {
        success: true,
        slot_number: slotNumber,
        team_id: registeredTeamId,
        message: `Slot #${slotNumber} secured!`,
      };
    } finally {
      inFlightBookingsRef.current.delete(slotKey);
    }
  };

  const freeSlot = (tournamentId, slotNumber, adminName = 'PantherAdmin') => {
    const slot = slots.find(s => s.tournament_id === tournamentId && s.slot_number === slotNumber);
    const team = teams.find(t => t.id === slot?.team_id);

    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
          const freed = { ...s, team_id: null, status: 'open', booked_at: null };
          saveSlot(freed);
          return freed;
        }
        return s;
      });
      broadcast('SLOTS_UPDATED', updated);
      return updated;
    });

    addAdminLog('SLOT_REVOKED', `Freed Slot #${slotNumber} in ${tournamentId} (was: "${team?.name || 'Unknown'}").`, adminName);
  };

  const allotSlotManual = (tournamentId, slotNumber, teamId, adminName = 'PantherAdmin') => {
    const team = teams.find(t => t.id === teamId);
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
          const allotted = { ...s, team_id: teamId, status: 'booked', booked_at: new Date().toISOString() };
          saveSlot(allotted);
          return allotted;
        }
        return s;
      });
      broadcast('SLOTS_UPDATED', updated);
      return updated;
    });

    addAdminLog('SLOT_MANUAL_ALLOT', `Manually assigned Slot #${slotNumber} to "${team?.name || teamId}".`, adminName);
  };

  const checkInSlot = (tournamentId, slotNumber, adminName = 'PantherAdmin') => {
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
          const toggled = { ...s, status: s.status === 'checked_in' ? 'booked' : 'checked_in' };
          saveSlot(toggled);
          return toggled;
        }
        return s;
      });
      broadcast('SLOTS_UPDATED', updated);
      return updated;
    });
    addAdminLog('CHECK_IN_TOGGLED', `Toggled check-in for Slot #${slotNumber} in ${tournamentId}.`, adminName);
  };

  const bulkCheckInSlots = (tournamentId, adminName = 'PantherAdmin') => {
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.status === 'booked') {
          return { ...s, status: 'checked_in' };
        }
        return s;
      });
      broadcast('SLOTS_UPDATED', updated);
      const changed = updated.filter(s => s.tournament_id === tournamentId && s.status === 'checked_in');
      saveSlotsInBatch(changed);
      return updated;
    });
    addAdminLog('BULK_CHECK_IN', `Verified check-in for all booked squads in ${tournamentId}.`, adminName);
  };

  const bulkFreeUncheckedSlots = (tournamentId, adminName = 'PantherAdmin') => {
    let freedCount = 0;
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.status === 'booked') {
          freedCount++;
          return { ...s, team_id: null, status: 'open', booked_at: null };
        }
        return s;
      });
      broadcast('SLOTS_UPDATED', updated);
      const freed = updated.filter(s => s.tournament_id === tournamentId && s.status === 'open' && !s.team_id);
      saveSlotsInBatch(freed);
      return updated;
    });
    addAdminLog('BULK_FREE_SLOTS', `Freed ${freedCount} unchecked slots in ${tournamentId}.`, adminName);
  };

  // ==========================================
  // FIREBASE REGISTRATION & PAYMENT APPROVALS
  // ==========================================
  const approveRegistration = async (registrationId, adminName = 'PantherAdmin') => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, error: 'Registration not found.' };

    await updateRegistrationStatusInFirebase(registrationId, 'accepted', 'Verified by Admin', adminName);

    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === reg.tournament_id && s.slot_number === reg.slot_number) {
          const approved = { ...s, team_id: reg.team_id, status: 'booked', payment_status: 'verified' };
          saveSlot(approved);
          return approved;
        }
        return s;
      });
      broadcast('SLOTS_UPDATED', updated);
      return updated;
    });

    setTeams(prev => {
      const updated = prev.map(t => {
        if (t.id === reg.team_id) {
          const updatedTeam = {
            ...t,
            payment: {
              ...t.payment,
              utr: reg.payment?.utr || reg.utr,
              status: 'verified',
              verified_at: new Date().toISOString(),
            },
          };
          saveTeam(updatedTeam);
          return updatedTeam;
        }
        return t;
      });
      broadcast('TEAMS_UPDATED', updated);
      return updated;
    });

    addAdminLog(
      'REGISTRATION_ACCEPTED',
      `Accepted [${reg.team_tag || 'TAG'}] ${reg.team_name} for Slot #${reg.slot_number}. UTR: ${reg.payment?.utr || 'N/A'} verified.`,
      adminName
    );

    return { success: true };
  };

  const rejectRegistration = async (registrationId, reason = 'UTR verification failed', adminName = 'PantherAdmin') => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, error: 'Registration not found.' };

    await updateRegistrationStatusInFirebase(registrationId, 'rejected', reason, adminName);

    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === reg.tournament_id && s.slot_number === reg.slot_number) {
          const freed = { ...s, team_id: null, status: 'open', booked_at: null };
          saveSlot(freed);
          return freed;
        }
        return s;
      });
      broadcast('SLOTS_UPDATED', updated);
      return updated;
    });

    addAdminLog(
      'REGISTRATION_REJECTED',
      `Rejected [${reg.team_tag || 'TAG'}] ${reg.team_name} (Slot #${reg.slot_number}). Reason: ${reason}. Slot freed.`,
      adminName
    );

    return { success: true };
  };

  // ==========================================
  // MATCH RESULTS & LEADERBOARD
  // ==========================================
  const submitMatchResults = (tournamentId, roundNumber, results, adminName = 'PantherAdmin') => {
    const calculatedResults = results.map(res => {
      const score = calculateMatchScore(res.placement, res.kills);
      const team = teams.find(t => t.id === res.team_id);
      return {
        team_id: res.team_id,
        team_name: team?.name || 'Unknown Team',
        team_tag: team?.tag || 'TEAM',
        placement: score.placement,
        placement_pts: score.placementPoints,
        kills: score.kills,
        kill_pts: score.killPoints,
        total_pts: score.totalPoints,
        is_booyah: score.isBooyah,
      };
    });

    const newMatch = {
      id: `match-${tournamentId}-r${roundNumber}-${Date.now()}`,
      tournament_id: tournamentId,
      round_number: roundNumber,
      result_data: calculatedResults,
      entered_by: adminName,
      created_at: new Date().toISOString(),
    };

    setMatches(prev => [...prev, newMatch]);
    saveMatch(newMatch);

    let newLeaderboardEntries = [];

    setLeaderboard(prev => {
      let updated = [...prev];

      calculatedResults.forEach(item => {
        // Tournament leaderboard
        const tId = `lb-${tournamentId}-${item.team_id}`;
        const tIndex = updated.findIndex(lb => lb.id === tId);
        if (tIndex >= 0) {
          updated[tIndex] = {
            ...updated[tIndex],
            points: updated[tIndex].points + item.total_pts,
            kills: updated[tIndex].kills + item.kills,
            wins: updated[tIndex].wins + (item.is_booyah ? 1 : 0),
            matches_played: (updated[tIndex].matches_played || 0) + 1,
            updated_at: new Date().toISOString(),
          };
          newLeaderboardEntries.push(updated[tIndex]);
        } else {
          const entry = {
            id: tId,
            tournament_id: tournamentId,
            team_id: item.team_id,
            team_name: item.team_name,
            team_tag: item.team_tag,
            points: item.total_pts,
            kills: item.kills,
            wins: item.is_booyah ? 1 : 0,
            matches_played: 1,
            updated_at: new Date().toISOString(),
          };
          updated.push(entry);
          newLeaderboardEntries.push(entry);
        }

        // Global leaderboard
        const gId = `glb-${item.team_id}`;
        const gIndex = updated.findIndex(lb => lb.id === gId);
        if (gIndex >= 0) {
          updated[gIndex] = {
            ...updated[gIndex],
            points: updated[gIndex].points + item.total_pts,
            kills: updated[gIndex].kills + item.kills,
            wins: updated[gIndex].wins + (item.is_booyah ? 1 : 0),
            matches_played: (updated[gIndex].matches_played || 0) + 1,
            updated_at: new Date().toISOString(),
          };
          newLeaderboardEntries.push(updated[gIndex]);
        } else {
          const entry = {
            id: gId,
            tournament_id: null,
            team_id: item.team_id,
            team_name: item.team_name,
            team_tag: item.team_tag,
            points: item.total_pts,
            kills: item.kills,
            wins: item.is_booyah ? 1 : 0,
            matches_played: 1,
            updated_at: new Date().toISOString(),
          };
          updated.push(entry);
          newLeaderboardEntries.push(entry);
        }
      });

      broadcast('LEADERBOARD_UPDATED', updated);
      return updated;
    });

    // Persist all leaderboard changes to Firestore
    if (newLeaderboardEntries.length > 0) {
      saveLeaderboardBatch(newLeaderboardEntries);
    }

    const booyahWinner = calculatedResults.find(r => r.is_booyah);
    addAdminLog(
      'MATCH_RESULTS_ENTERED',
      `Entered Round ${roundNumber} results for ${tournamentId}. Booyah: ${booyahWinner?.team_name || 'N/A'}.`,
      adminName
    );

    return newMatch;
  };

  // ─── Selectors ──────────────────────────────────────────────────────────────
  const getTournamentSlots = useCallback((tourneyId) => {
    const tourney = tournaments.find(t => t.id === tourneyId);
    const maxSlots = tourney?.total_slots || 12;
    return slots
      .filter(s => s.tournament_id === tourneyId && s.slot_number <= maxSlots)
      .sort((a, b) => a.slot_number - b.slot_number);
  }, [slots, tournaments]);

  const getTeamById = useCallback((teamId) =>
    teams.find(t => t.id === teamId) || null,
  [teams]);

  const getTournamentLeaderboard = useCallback((tourneyId) =>
    sortLeaderboard(leaderboard.filter(lb => lb.tournament_id === tourneyId)),
  [leaderboard]);

  const getGlobalLeaderboard = useCallback(() =>
    sortLeaderboard(leaderboard.filter(lb => lb.tournament_id === null)),
  [leaderboard]);

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        slots,
        teams,
        leaderboard,
        adminLogs,
        matches,
        registrations,
        isLoading,
        syncError,
        approveRegistration,
        rejectRegistration,
        createTournament,
        updateTournament,
        deleteTournament,
        updateTournamentRoom,
        updateTournamentStatus,
        bookSlot,
        freeSlot,
        allotSlotManual,
        checkInSlot,
        bulkCheckInSlots,
        bulkFreeUncheckedSlots,
        submitMatchResults,
        getTournamentSlots,
        getTeamById,
        getTournamentLeaderboard,
        getGlobalLeaderboard,
        addAdminLog,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error('useTournaments must be used within a TournamentProvider');
  return context;
};
