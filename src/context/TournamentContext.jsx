import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_TOURNAMENTS, INITIAL_TEAMS, generateInitialSlots, INITIAL_LEADERBOARD, INITIAL_ADMIN_LOGS } from '../lib/seedData';
import { calculateMatchScore, sortLeaderboard } from '../lib/scoring';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  subscribeToRegistrations,
  saveRegistrationToFirebase,
  updateRegistrationStatusInFirebase
} from '../lib/firebaseRegistration';

const TournamentContext = createContext(null);

const STORAGE_KEYS = {
  TOURNAMENTS: 'panthers_tournaments_v2',
  SLOTS: 'panthers_slots_v2',
  TEAMS: 'panthers_teams_v2',
  LEADERBOARD: 'panthers_leaderboard_v2',
  ADMIN_LOGS: 'panthers_admin_logs_v2',
  MATCHES: 'panthers_matches_v2',
};

export const TournamentProvider = ({ children }) => {
  // Load initial or local state
  const [tournaments, setTournaments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  });

  const [slots, setSlots] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SLOTS);
      return saved ? JSON.parse(saved) : generateInitialSlots();
    } catch {
      return generateInitialSlots();
    }
  });

  const [teams, setTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      return saved ? JSON.parse(saved) : INITIAL_TEAMS;
    } catch {
      return INITIAL_TEAMS;
    }
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  });

  const [adminLogs, setAdminLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_LOGS;
    } catch {
      return INITIAL_ADMIN_LOGS;
    }
  });

  const [matches, setMatches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real-time Firebase tournament registrations with UTR numbers
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToRegistrations((newRegs) => {
      setRegistrations(newRegs);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Cross-tab real-time communication channel
  const broadcastRef = useRef(null);
  const lastBookingTimeRef = useRef(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
    } catch (e) { console.error(e); }
  }, [tournaments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
    } catch (e) { console.error(e); }
  }, [slots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    } catch (e) { console.error(e); }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    } catch (e) { console.error(e); }
  }, [leaderboard]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(adminLogs));
    } catch (e) { console.error(e); }
  }, [adminLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    } catch (e) { console.error(e); }
  }, [matches]);

  // Sync across tabs via BroadcastChannel
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('panthers_esports_realtime');
      broadcastRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SLOTS_UPDATED') {
          setSlots(payload);
        } else if (type === 'TOURNAMENTS_UPDATED') {
          setTournaments(payload);
        } else if (type === 'LEADERBOARD_UPDATED') {
          setLeaderboard(payload);
        } else if (type === 'TEAMS_UPDATED') {
          setTeams(payload);
        } else if (type === 'LOGS_UPDATED') {
          setAdminLogs(payload);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Supabase Realtime listeners if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('public_panthers_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slots' }, (payload) => {
        console.log('Supabase Realtime Slot Change:', payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, (payload) => {
        console.log('Supabase Realtime Tournament Change:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const broadcastChange = (type, payload) => {
    if (broadcastRef.current) {
      broadcastRef.current.postMessage({ type, payload });
    }
  };

  const addAdminLog = useCallback((action, details, adminName = 'PantherAdmin') => {
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      admin_name: adminName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setAdminLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50);
      broadcastChange('LOGS_UPDATED', updated);
      return updated;
    });
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
        '3rd': `₹${Math.round(data.prize_pool * 0.2)}`
      },
      total_slots: totalSlots,
      status: 'upcoming',
      room_id: data.room_id || null,
      room_password: data.room_password || null,
      rules: data.rules || 'Standard Free Fire competitive rules apply.',
      created_at: new Date().toISOString()
    };

    // Auto-generate empty slot rows for this tournament
    const newSlots = [];
    for (let i = 1; i <= totalSlots; i++) {
      newSlots.push({
        id: `slot-${newId}-${i}`,
        tournament_id: newId,
        slot_number: i,
        team_id: null,
        status: 'open',
        booked_at: null
      });
    }

    setTournaments(prev => {
      const updated = [newTournament, ...prev];
      broadcastChange('TOURNAMENTS_UPDATED', updated);
      return updated;
    });

    setSlots(prev => {
      const updated = [...prev, ...newSlots];
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });

    addAdminLog('TOURNAMENT_CREATED', `Created "${newTournament.name}" with ${totalSlots} slots.`, adminName);
    return newTournament;
  };

  const updateTournament = (id, data, adminName = 'PantherAdmin') => {
    setTournaments(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...data, updated_at: new Date().toISOString() } : t);
      broadcastChange('TOURNAMENTS_UPDATED', updated);
      return updated;
    });
    addAdminLog('TOURNAMENT_UPDATED', `Updated tournament details for ${id}.`, adminName);
  };

  const deleteTournament = (id, adminName = 'PantherAdmin') => {
    const t = tournaments.find(item => item.id === id);
    setTournaments(prev => {
      const updated = prev.filter(item => item.id !== id);
      broadcastChange('TOURNAMENTS_UPDATED', updated);
      return updated;
    });
    setSlots(prev => {
      const updated = prev.filter(s => s.tournament_id !== id);
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });
    addAdminLog('TOURNAMENT_DELETED', `Deleted tournament "${t?.name || id}".`, adminName);
  };

  const updateTournamentRoom = (id, roomId, roomPassword, adminName = 'PantherAdmin') => {
    setTournaments(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, room_id: roomId, room_password: roomPassword } : t);
      broadcastChange('TOURNAMENTS_UPDATED', updated);
      return updated;
    });
    addAdminLog('ROOM_CREDENTIALS_UPDATED', `Room ID & password updated for tournament ${id}.`, adminName);
  };

  const updateTournamentStatus = (id, status, adminName = 'PantherAdmin') => {
    setTournaments(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status } : t);
      broadcastChange('TOURNAMENTS_UPDATED', updated);
      return updated;
    });
    addAdminLog('STATUS_CHANGED', `Changed tournament ${id} status to ${status.toUpperCase()}.`, adminName);
  };

  // ==========================================
  // SLOT BOOKING & MANAGEMENT (Race-Condition Protected)
  // ==========================================
  const bookSlot = (tournamentId, slotNumber, teamRegistrationData) => {
    // 1. Rate limiting check (prevent bot spam: max 1 booking attempt every 1.5 seconds)
    const now = Date.now();
    if (now - lastBookingTimeRef.current < 1500) {
      return { success: false, error: 'Booking too quickly. Please wait a moment and try again.' };
    }
    lastBookingTimeRef.current = now;

    // 2. Validate slot availability
    const targetSlot = slots.find(s => s.tournament_id === tournamentId && s.slot_number === slotNumber);
    if (!targetSlot) {
      return { success: false, error: 'Slot does not exist.' };
    }
    if (targetSlot.status !== 'open') {
      return { success: false, error: `Slot #${slotNumber} has already been taken by another team!` };
    }

    // 3. Check if team is already registered in this tournament
    const existingTeamBooking = slots.find(
      s => s.tournament_id === tournamentId && s.team_id && s.team_id === teamRegistrationData.team_id
    );
    if (existingTeamBooking) {
      return { success: false, error: `Your team is already booked in Slot #${existingTeamBooking.slot_number}!` };
    }

    // 4. Register / save team data
    let registeredTeamId = teamRegistrationData.team_id;
    if (!registeredTeamId || !teams.find(t => t.id === registeredTeamId)) {
      registeredTeamId = `team-${Date.now()}`;
      const newTeam = {
        id: registeredTeamId,
        name: teamRegistrationData.team_name,
        tag: teamRegistrationData.team_tag || teamRegistrationData.team_name.substring(0, 4).toUpperCase(),
        captain_user_id: teamRegistrationData.captain_user_id || 'user-player-1',
        captain_name: teamRegistrationData.captain_name,
        captain_phone: teamRegistrationData.captain_phone,
        captain_uid: teamRegistrationData.captain_uid,
        players: teamRegistrationData.players || [],
        payment: teamRegistrationData.payment || null
      };

      setTeams(prev => {
        const updated = [...prev, newTeam];
        broadcastChange('TEAMS_UPDATED', updated);
        return updated;
      });
    }

    // 5. Atomic Slot Update
    let slotUpdated = false;
    setSlots(prev => {
      // Final atomic guard: verify again in latest state
      const current = prev.find(s => s.tournament_id === tournamentId && s.slot_number === slotNumber);
      if (!current || current.status !== 'open') {
        return prev;
      }

      slotUpdated = true;
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
          return {
            ...s,
            team_id: registeredTeamId,
            status: 'booked',
            booked_at: new Date().toISOString()
          };
        }
        return s;
      });

      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });

    if (!slotUpdated) {
      return { success: false, error: `Slot #${slotNumber} was just booked by another player.` };
    }

    // Save registration with 12-digit UTR directly into Firebase Firestore
    const targetTourney = tournaments.find(t => t.id === tournamentId);
    saveRegistrationToFirebase({
      ...teamRegistrationData,
      tournament_id: tournamentId,
      tournament_name: targetTourney?.name || 'Panthers Free Fire Tri-Map Series',
      slot_number: slotNumber,
      team_id: registeredTeamId
    }).catch(err => console.warn('Firebase registration sync note:', err));

    return {
      success: true,
      slot_number: slotNumber,
      team_id: registeredTeamId,
      message: `Slot #${slotNumber} successfully secured for Panthers Esports!`
    };
  };

  // Admin slot overrides
  const freeSlot = (tournamentId, slotNumber, adminName = 'PantherAdmin') => {
    const slot = slots.find(s => s.tournament_id === tournamentId && s.slot_number === slotNumber);
    const team = teams.find(t => t.id === slot?.team_id);

    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
          return {
            ...s,
            team_id: null,
            status: 'open',
            booked_at: null
          };
        }
        return s;
      });
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });

    addAdminLog(
      'SLOT_REVOKED',
      `Freed Slot #${slotNumber} in tournament ${tournamentId} (was booked by "${team?.name || 'Unknown'}").`,
      adminName
    );
  };

  const allotSlotManual = (tournamentId, slotNumber, teamId, adminName = 'PantherAdmin') => {
    const team = teams.find(t => t.id === teamId);
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
          return {
            ...s,
            team_id: teamId,
            status: 'booked',
            booked_at: new Date().toISOString()
          };
        }
        return s;
      });
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });

    addAdminLog(
      'SLOT_MANUAL_ALLOT',
      `Manually assigned Slot #${slotNumber} to "${team?.name || teamId}" in tournament ${tournamentId}.`,
      adminName
    );
  };

  const checkInSlot = (tournamentId, slotNumber, adminName = 'PantherAdmin') => {
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.slot_number === slotNumber) {
          return {
            ...s,
            status: s.status === 'checked_in' ? 'booked' : 'checked_in'
          };
        }
        return s;
      });
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });

    addAdminLog('CHECK_IN_TOGGLED', `Toggled check-in status for Slot #${slotNumber} in ${tournamentId}.`, adminName);
  };

  const bulkCheckInSlots = (tournamentId, adminName = 'PantherAdmin') => {
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === tournamentId && s.status === 'booked') {
          return { ...s, status: 'checked_in' };
        }
        return s;
      });
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });
    addAdminLog('BULK_CHECK_IN', `Verified check-in for all booked squads in tournament ${tournamentId}.`, adminName);
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
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });
    addAdminLog('BULK_FREE_SLOTS', `Freed ${freedCount} unchecked slots in tournament ${tournamentId}.`, adminName);
  };

  // ==========================================
  // FIREBASE REGISTRATION & PAYMENT APPROVALS
  // ==========================================
  const approveRegistration = async (registrationId, adminName = 'PantherAdmin') => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, error: 'Registration record not found.' };

    await updateRegistrationStatusInFirebase(registrationId, 'accepted', 'Verified by Admin', adminName);

    // Mark slot as booked & verified
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === reg.tournament_id && s.slot_number === reg.slot_number) {
          return {
            ...s,
            team_id: reg.team_id,
            status: 'booked',
            payment_status: 'verified'
          };
        }
        return s;
      });
      broadcastChange('SLOTS_UPDATED', updated);
      return updated;
    });

    // Mark team payment verified
    setTeams(prev => {
      const updated = prev.map(t => {
        if (t.id === reg.team_id) {
          return {
            ...t,
            payment: {
              ...t.payment,
              utr: reg.payment?.utr || reg.utr,
              status: 'verified',
              verified_at: new Date().toISOString()
            }
          };
        }
        return t;
      });
      broadcastChange('TEAMS_UPDATED', updated);
      return updated;
    });

    addAdminLog(
      'REGISTRATION_ACCEPTED',
      `Accepted [${reg.team_tag || 'TAG'}] ${reg.team_name} for Slot #${reg.slot_number}. UTR: ${reg.payment?.utr || 'N/A'} verified.`,
      adminName
    );

    return { success: true };
  };

  const rejectRegistration = async (registrationId, reason = 'UTR verification failed or amount mismatch', adminName = 'PantherAdmin') => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return { success: false, error: 'Registration record not found.' };

    await updateRegistrationStatusInFirebase(registrationId, 'rejected', reason, adminName);

    // Free the slot so other teams can register
    setSlots(prev => {
      const updated = prev.map(s => {
        if (s.tournament_id === reg.tournament_id && s.slot_number === reg.slot_number) {
          return {
            ...s,
            team_id: null,
            status: 'open',
            booked_at: null
          };
        }
        return s;
      });
      broadcastChange('SLOTS_UPDATED', updated);
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
  // MATCH RESULTS & FREE FIRE POINT CALCULATION
  // ==========================================
  const submitMatchResults = (tournamentId, roundNumber, results, adminName = 'PantherAdmin') => {
    // results is array of: { team_id, placement, kills }
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
        is_booyah: score.isBooyah
      };
    });

    // Save match
    const newMatch = {
      id: `match-${tournamentId}-r${roundNumber}-${Date.now()}`,
      tournament_id: tournamentId,
      round_number: roundNumber,
      result_data: calculatedResults,
      entered_by: adminName,
      created_at: new Date().toISOString()
    };

    setMatches(prev => [...prev, newMatch]);

    // Update tournament leaderboard and global leaderboard
    setLeaderboard(prev => {
      let updated = [...prev];

      calculatedResults.forEach(item => {
        // 1. Tournament specific leaderboard entry
        const tIndex = updated.findIndex(
          lb => lb.tournament_id === tournamentId && lb.team_id === item.team_id
        );

        if (tIndex >= 0) {
          updated[tIndex] = {
            ...updated[tIndex],
            points: updated[tIndex].points + item.total_pts,
            kills: updated[tIndex].kills + item.kills,
            wins: updated[tIndex].wins + (item.is_booyah ? 1 : 0),
            matches_played: (updated[tIndex].matches_played || 0) + 1,
            updated_at: new Date().toISOString()
          };
        } else {
          updated.push({
            id: `lb-${tournamentId}-${item.team_id}`,
            tournament_id: tournamentId,
            team_id: item.team_id,
            team_name: item.team_name,
            team_tag: item.team_tag,
            points: item.total_pts,
            kills: item.kills,
            wins: item.is_booyah ? 1 : 0,
            matches_played: 1,
            updated_at: new Date().toISOString()
          });
        }

        // 2. Global leaderboard entry (tournament_id === null)
        const gIndex = updated.findIndex(
          lb => lb.tournament_id === null && lb.team_id === item.team_id
        );

        if (gIndex >= 0) {
          updated[gIndex] = {
            ...updated[gIndex],
            points: updated[gIndex].points + item.total_pts,
            kills: updated[gIndex].kills + item.kills,
            wins: updated[gIndex].wins + (item.is_booyah ? 1 : 0),
            matches_played: (updated[gIndex].matches_played || 0) + 1,
            updated_at: new Date().toISOString()
          };
        } else {
          updated.push({
            id: `glb-${item.team_id}`,
            tournament_id: null,
            team_id: item.team_id,
            team_name: item.team_name,
            team_tag: item.team_tag,
            points: item.total_pts,
            kills: item.kills,
            wins: item.is_booyah ? 1 : 0,
            matches_played: 1,
            updated_at: new Date().toISOString()
          });
        }
      });

      broadcastChange('LEADERBOARD_UPDATED', updated);
      return updated;
    });

    const booyahWinner = calculatedResults.find(r => r.is_booyah);
    addAdminLog(
      'MATCH_RESULTS_ENTERED',
      `Entered Round ${roundNumber} results for tournament ${tournamentId}. Booyah: ${booyahWinner?.team_name || 'N/A'}.`,
      adminName
    );

    return newMatch;
  };

  // Helper selectors
  const getTournamentSlots = useCallback((tourneyId) => {
    return slots
      .filter(s => s.tournament_id === tourneyId)
      .sort((a, b) => a.slot_number - b.slot_number);
  }, [slots]);

  const getTeamById = useCallback((teamId) => {
    return teams.find(t => t.id === teamId) || null;
  }, [teams]);

  const getTournamentLeaderboard = useCallback((tourneyId) => {
    const list = leaderboard.filter(lb => lb.tournament_id === tourneyId);
    return sortLeaderboard(list);
  }, [leaderboard]);

  const getGlobalLeaderboard = useCallback(() => {
    const list = leaderboard.filter(lb => lb.tournament_id === null);
    return sortLeaderboard(list);
  }, [leaderboard]);

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
  if (!context) {
    throw new Error('useTournaments must be used within a TournamentProvider');
  }
  return context;
};
