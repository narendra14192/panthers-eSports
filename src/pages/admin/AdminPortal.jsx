import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { FREE_FIRE_PLACEMENT_POINTS, calculateMatchScore, formatCurrency } from '../../lib/scoring';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Shield,
  LayoutDashboard,
  Grid3X3,
  Key,
  Trophy,
  Users,
  Terminal,
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  ExternalLink,
  Printer,
  Radio,
  Clock,
  MapPin,
  Flame,
  AlertTriangle,
  ChevronRight,
  Eye,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  Lock,
  LogOut,
  ArrowLeft,
  IndianRupee,
  XCircle,
  BadgeCheck,
  Plus,
  Calendar,
  CalendarPlus,
  Megaphone,
  Check,
  AlertCircle,
  Share2,
  Bell,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPortal = ({ onExitToPublic }) => {
  const { user, isAdmin, loginAsAdmin, switchRole } = useAuth();
  const {
    tournaments,
    slots,
    teams,
    adminLogs,
    registrations = [],
    announcement,
    publishAnnouncement,
    clearAnnouncement,
    createTournament,
    updateTournament,
    deleteTournament,
    approveRegistration,
    rejectRegistration,
    updateTournamentRoom,
    updateTournamentStatus,
    checkInSlot,
    freeSlot,
    allotSlotManual,
    bulkCheckInSlots,
    bulkFreeUncheckedSlots,
    submitMatchResults,
    getTeamById
  } = useTournaments();

  // Active navigation tab
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'events' | 'slots' | 'payments' | 'room' | 'scoring' | 'teams' | 'audit'

  // Firebase Registration & Payment State
  const [regFilter, setRegFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  const [regSearch, setRegSearch] = useState('');
  const [copiedUtr, setCopiedUtr] = useState(null);
  const [processingRegId, setProcessingRegId] = useState(null);

  // Selected tournament state (enables managing multiple events)
  const [selectedTourneyId, setSelectedTourneyId] = useState(() => tournaments[0]?.id || '');
  useEffect(() => {
    if (!selectedTourneyId && tournaments.length > 0) {
      setSelectedTourneyId(tournaments[0].id);
    }
  }, [tournaments, selectedTourneyId]);
  const activeTournament = tournaments.find(t => t.id === selectedTourneyId) || tournaments[0] || null;

  // Modal State for Announcing / Creating a New Event
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEventData, setNewEventData] = useState({
    name: '',
    mode: 'Squad (4v4)',
    map: 'Bermuda, Purgatory & Kalahari',
    date: new Date().toISOString().split('T')[0],
    time: '20:00',
    entry_fee: 50,
    prize_pool: 400,
    total_slots: 12,
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    rules: `1. ESPORTS RULES ONLY — Gun skin attributes are strictly OFF (Default weapon stats only).
2. NO EMULATORS / IPADS — Mobile phone devices only. Emulators, PCs, and tablets are strictly banned.
3. 3 MATCHES BACK-TO-BACK — Bermuda, Purgatory, Kalahari.
4. OFFICIAL FREE FIRE SCORING: 1st: 12 pts, 2nd: 9 pts, 3rd: 8 pts... + 1 pt per kill.
5. ANTI-CHEAT & ANTI-TEAMING — Zero tolerance. Immediate disqualification.`,
    description: 'Official Panthers Esports Free Fire Battle Royale Tournament. 12 squads fight for the Booyah!'
  });

  // Live Broadcast Notice State ("or anything")
  const [broadcastNoticeText, setBroadcastNoticeText] = useState(announcement?.text || '');
  const [broadcastNoticeType, setBroadcastNoticeType] = useState(announcement?.type || 'flame');
  const [broadcastNoticeLink, setBroadcastNoticeLink] = useState(announcement?.link || '');
  const [broadcastNoticeActive, setBroadcastNoticeActive] = useState(announcement?.active !== false);
  const [noticeSaved, setNoticeSaved] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    if (announcement) {
      setBroadcastNoticeText(announcement.text || '');
      setBroadcastNoticeType(announcement.type || 'flame');
      setBroadcastNoticeLink(announcement.link || '');
      setBroadcastNoticeActive(announcement.active !== false);
    }
  }, [announcement]);

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Passcode gate if not admin
  const [passcode, setPasscode] = useState('sukuna@rusher');
  const [authError, setAuthError] = useState('');

  // Slot Management State
  const [slotFilter, setSlotFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'BOOKED' | 'CHECKED_IN'
  const [slotSearch, setSlotSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [inspectingTeam, setInspectingTeam] = useState(null);
  const [allottingSlotNum, setAllottingSlotNum] = useState(null);
  const [manualTeamSelect, setManualTeamSelect] = useState('');
  const [allotTab, setAllotTab] = useState('new'); // 'new' | 'existing'
  const [newSquadData, setNewSquadData] = useState({
    name: '',
    tag: '',
    captain_name: '',
    captain_uid: '',
    captain_phone: '',
  });

  // Room Credentials State
  const [roomId, setRoomId] = useState(activeTournament?.room_id || '');
  const [roomPassword, setRoomPassword] = useState(activeTournament?.room_password || '');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [copiedAnnouncement, setCopiedAnnouncement] = useState(false);

  // 3-Match Scoring Console State
  const [activeMatchRound, setActiveMatchRound] = useState(1); // 1 (Bermuda), 2 (Purgatory), 3 (Kalahari)
  const [roundScores, setRoundScores] = useState([]);
  const [scoreSuccess, setScoreSuccess] = useState('');
  const [scoreError, setScoreError] = useState('');

  // Sync tournament room state
  useEffect(() => {
    if (activeTournament) {
      setRoomId(activeTournament.room_id || '');
      setRoomPassword(activeTournament.room_password || '');
    }
  }, [activeTournament?.room_id, activeTournament?.room_password]);

  if (!activeTournament) return null;

  const totalSlotsCount = activeTournament.total_slots || 12;

  // Unified slot matrix: merges slot state with real-time registrations
  const tourneySlots = Array.from({ length: totalSlotsCount }, (_, idx) => {
    const slotNum = idx + 1;
    const baseSlot = slots.find(
      s => s.tournament_id === activeTournament.id && s.slot_number === slotNum
    ) || {
      id: `slot-${activeTournament.id}-${slotNum}`,
      tournament_id: activeTournament.id,
      slot_number: slotNum,
      team_id: null,
      status: 'open',
    };

    // Find any registration matching this slot
    const reg = (registrations || []).find(
      r => (r.tournament_id === activeTournament.id || !r.tournament_id) && Number(r.slot_number) === slotNum
    );

    const team = baseSlot.team_id ? getTeamById(baseSlot.team_id) : (reg ? getTeamById(reg.team_id) : null);

    // If registration exists and slot is open or pending
    if (reg && (baseSlot.status === 'open' || !baseSlot.team_id)) {
      return {
        ...baseSlot,
        team_id: reg.team_id || baseSlot.team_id,
        status: reg.status === 'accepted' ? 'booked' : 'pending_verification',
        registration: reg,
        virtualTeam: team || {
          id: reg.team_id,
          name: reg.team_name,
          tag: reg.team_tag || reg.team_name?.substring(0, 4).toUpperCase(),
          captain_name: reg.captain_name,
          captain_phone: reg.captain_phone,
          captain_uid: reg.captain_uid,
          players: reg.players || [],
          payment: reg.payment,
        }
      };
    }

    return {
      ...baseSlot,
      registration: reg || null,
      virtualTeam: team,
    };
  });

  const bookedSlots = tourneySlots.filter(s => s.status !== 'open');
  const checkedInSlots = tourneySlots.filter(s => s.status === 'checked_in');
  const openSlots = tourneySlots.filter(s => s.status === 'open');

  // Revenue & Metrics
  const occupancyPercent = Math.round((bookedSlots.length / totalSlotsCount) * 100);
  const entryFee = activeTournament.entry_fee || 50;
  const totalRevenueCollected = bookedSlots.length * entryFee;
  // ── Unified Registrations & Approvals (Merged across Firebase & context slots) ──
  const allRegistrationsMap = new Map();

  (registrations || []).forEach(reg => {
    allRegistrationsMap.set(reg.id, {
      ...reg,
      slot_number: reg.slot_number,
      team_name: reg.team_name,
      team_tag: reg.team_tag,
      captain_phone: reg.captain_phone,
      captain_uid: reg.captain_uid,
      utr: reg.payment?.utr || reg.utr,
      amount: reg.payment?.amount || activeTournament?.entry_fee || 50,
      status: reg.status || 'pending',
      created_at: reg.created_at || new Date().toISOString()
    });
  });

  tourneySlots.forEach(slot => {
    if (slot.status === 'open') return;
    const team = slot.virtualTeam || (slot.team_id ? getTeamById(slot.team_id) : null);
    if (!team) return;

    const existing = Array.from(allRegistrationsMap.values()).find(
      r => Number(r.slot_number) === Number(slot.slot_number) || r.team_id === slot.team_id
    );

    if (!existing) {
      const syntheticId = `slot-reg-${slot.id || slot.slot_number}`;
      allRegistrationsMap.set(syntheticId, {
        id: syntheticId,
        slot_number: slot.slot_number,
        team_id: team.id,
        team_name: team.name,
        team_tag: team.tag,
        captain_phone: team.captain_phone || '—',
        captain_uid: team.captain_uid || '—',
        utr: slot.registration?.payment?.utr || slot.registration?.utr || team.payment?.utr || 'Pending UTR',
        amount: team.payment?.amount || activeTournament?.entry_fee || 50,
        status: (team.payment?.status === 'verified' || slot.status === 'checked_in') ? 'accepted' : 'pending',
        created_at: slot.booked_at || new Date().toISOString()
      });
    }
  });

  const allRegistrations = Array.from(allRegistrationsMap.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const pendingApprovalsCount = allRegistrations.filter(r => {
    const isThisTourney = !r.tournament_id || !activeTournament?.id || r.tournament_id === activeTournament.id;
    return isThisTourney && (r.status === 'pending' || r.status === 'pending_verification' || r.payment?.status === 'pending_verification');
  }).length;

  // Initialize scoring table with booked squads
  useEffect(() => {
    const rows = bookedSlots.map((slot, idx) => {
      const team = getTeamById(slot.team_id);
      return {
        slot_number: slot.slot_number,
        team_id: slot.team_id,
        team_name: team?.name || `Squad Slot #${slot.slot_number}`,
        team_tag: team?.tag || 'TAG',
        placement: idx + 1,
        kills: 0
      };
    });
    setRoundScores(rows);
  }, [activeTournament.id, bookedSlots.length, activeMatchRound]);

  // Auth gate
  if (!isAdmin) {
    const handleLogin = (e) => {
      e.preventDefault();
      setAuthError('');
      const res = loginAsAdmin(passcode);
      if (!res.success) setAuthError(res.error || 'Invalid credentials');
    };

    return (
      <div className="min-h-screen bg-panther-950 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-panther-900 border border-red-500/50 rounded clip-hud p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-950 border border-red-600 flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-950/50">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-orbitron font-bold text-red-400 uppercase tracking-widest block mb-1">
              RESTRICTED OPERATIONS ACCESS
            </span>
            <h2 className="text-2xl font-orbitron font-black text-white uppercase tracking-wider">
              Panthers Staff Console
            </h2>
            <p className="text-xs text-gray-400 font-sans mt-1">
              Enter tournament referee authorization key to unlock controls.
            </p>
          </div>

          {/* Quick 1-Click Master Access Button */}
          <button
            type="button"
            onClick={() => {
              loginAsAdmin('sukuna@rusher');
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-flame-600 to-amber-gold hover:opacity-95 text-white font-orbitron font-bold text-xs py-3.5 px-4 rounded shadow-lg shadow-red-900/50 uppercase tracking-wider transition-all transform hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>⚡ Grant Instant Full Admin Access</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-panther-800" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">or authorize with key</span>
            <div className="flex-1 h-px bg-panther-800" />
          </div>

          {authError && (
            <div className="bg-red-950/80 border border-red-500 p-2.5 rounded text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                Admin Authorization Key
              </label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1 font-mono">
                Tournament referee key: <span className="text-gray-400">sukuna@rusher</span>
              </p>
            </div>

            <Button type="submit" variant="danger" className="w-full justify-center">
              Authenticate Staff Console
            </Button>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={onExitToPublic}
                className="text-xs font-rajdhani font-bold text-gray-400 hover:text-white uppercase flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Public Site
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter slots for search and status
  const filteredSlots = tourneySlots.filter(slot => {
    if (slotFilter === 'OPEN' && slot.status !== 'open') return false;
    if (slotFilter === 'BOOKED' && slot.status !== 'booked' && slot.status !== 'pending_verification') return false;
    if (slotFilter === 'CHECKED_IN' && slot.status !== 'checked_in') return false;

    if (slotSearch.trim()) {
      const q = slotSearch.toLowerCase();
      const team = slot.virtualTeam || (slot.team_id ? getTeamById(slot.team_id) : null);
      const matchSlot = String(slot.slot_number).includes(q);
      const matchTeam = team?.name?.toLowerCase().includes(q) || team?.tag?.toLowerCase().includes(q);
      const matchCaptain = team?.captain_name?.toLowerCase().includes(q) || team?.captain_uid?.includes(q);
      const matchPlayer = team?.players?.some(p => p.name?.toLowerCase().includes(q) || p.uid?.includes(q));
      if (!matchSlot && !matchTeam && !matchCaptain && !matchPlayer) return false;
    }

    return true;
  });

  // Handle room credentials save
  const handleSaveRoom = (e) => {
    e.preventDefault();
    updateTournamentRoom(activeTournament.id, roomId, roomPassword);
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 2500);
  };

  // Generate WhatsApp / Discord announcement for currently active tournament
  const announcementText = `🔥 *PANTHERS ESPORTS — ${activeTournament?.name?.toUpperCase() || '3-MAP CHAMPIONSHIP'}* 🔥
━━━━━━━━━━━━━━━━━━━━
🏆 *Format:* ${activeTournament?.mode || 'Squad'} (${activeTournament?.total_slots || 12} Slots)
📍 *Map:* ${activeTournament?.map || 'Bermuda, Purgatory & Kalahari'}
📅 *Date & Time:* ${activeTournament?.date || 'Today'} @ ${activeTournament?.time || '19:00'} IST
💰 *Prize Pool:* ₹${activeTournament?.prize_pool || 0} (Entry: ${activeTournament?.entry_fee ? `₹${activeTournament.entry_fee}` : 'FREE'})

🔑 *Custom Room ID:* ${roomId || 'PENDING'}
🔒 *Password:* ${roomPassword || 'PENDING'}

⚠️ *STRICT ESPORTS RULES:*
• Gun skin attributes strictly OFF
• Mobile phones only (NO emulators/tablets)
• Join your registered slot number immediately!
━━━━━━━━━━━━━━━━━━━━
_Panthers Esports Tournament Control_`;

  const handleCopyAnnouncement = () => {
    navigator.clipboard.writeText(announcementText);
    setCopiedAnnouncement(true);
    setTimeout(() => setCopiedAnnouncement(false), 2500);
  };

  // Generate WhatsApp / Discord Tournament Invitation Broadcast
  const eventInviteText = `🔥 *PANTHERS ESPORTS — NEW EVENT ANNOUNCEMENT* 🔥
━━━━━━━━━━━━━━━━━━━━
⚔️ *${activeTournament?.name || 'Panthers Championship'}*
🏆 *Prize Pool:* ₹${activeTournament?.prize_pool || 0}
🎟️ *Entry Fee:* ${activeTournament?.entry_fee ? `₹${activeTournament.entry_fee}` : 'FREE'}
📍 *Map:* ${activeTournament?.map || 'Bermuda, Purgatory & Kalahari'}
📅 *Schedule:* ${activeTournament?.date || 'Today'} at ${activeTournament?.time || '20:00'} IST
👥 *Slots:* ${activeTournament?.total_slots || 12} Slots Only!

📲 *Register Your Squad Online:*
${typeof window !== 'undefined' ? window.location.origin : ''}/#/tournaments

_Panthers Esports Official Operations_`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(eventInviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  // Handle Event Creation Submit
  const handleCreateEventSubmit = (e) => {
    e.preventDefault();
    if (!newEventData.name.trim()) return;

    const entryNum = parseFloat(newEventData.entry_fee) || 0;
    const prizeNum = parseFloat(newEventData.prize_pool) || 0;
    const slotsNum = parseInt(newEventData.total_slots, 10) || 12;

    const created = createTournament({
      ...newEventData,
      entry_fee: entryNum,
      prize_pool: prizeNum,
      total_slots: slotsNum,
      prize_distribution: {
        '1st': `₹${Math.round(prizeNum * 0.5)}`,
        '2nd': `₹${Math.round(prizeNum * 0.3)}`,
        '3rd': `₹${Math.round(prizeNum * 0.2)}`,
      },
    }, user?.displayName || 'StaffAdmin');

    if (created?.id) {
      setSelectedTourneyId(created.id);
    }
    setShowCreateModal(false);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#FF4D00', '#FFB800', '#00F0FF']
      });
    } catch { /* ignore */ }
  };

  // Handle Broadcast Notice Save
  const handleSaveNotice = (e) => {
    e.preventDefault();
    publishAnnouncement({
      text: broadcastNoticeText,
      type: broadcastNoticeType,
      link: broadcastNoticeLink,
      active: broadcastNoticeActive
    }, user?.displayName || 'StaffAdmin');
    setNoticeSaved(true);
    setTimeout(() => setNoticeSaved(false), 2500);
  };

  // Handle Clear Broadcast Notice
  const handleClearNotice = () => {
    clearAnnouncement(user?.displayName || 'StaffAdmin');
    setBroadcastNoticeText('');
    setNoticeSaved(true);
    setTimeout(() => setNoticeSaved(false), 2500);
  };

  // Handle Score Input
  const handleScoreChange = (teamId, field, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setRoundScores(prev => prev.map(r => r.team_id === teamId ? { ...r, [field]: num } : r));
  };

  const handlePublishRoundScores = (e) => {
    e.preventDefault();
    setScoreError('');
    setScoreSuccess('');

    if (roundScores.length === 0) {
      setScoreError('No teams available to score.');
      return;
    }

    // Check duplicate placements
    const placements = roundScores.map(r => r.placement);
    if (new Set(placements).size !== placements.length) {
      setScoreError('Duplicate placements detected! Each squad must have a unique rank (1 to 12).');
      return;
    }

    submitMatchResults(activeTournament.id, activeMatchRound, roundScores);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#FFB800', '#FF4D00', '#00F0FF']
      });
    } catch { /* ignore */ }

    setScoreSuccess(`Match ${activeMatchRound} (${activeMatchRound === 1 ? 'Bermuda' : activeMatchRound === 2 ? 'Purgatory' : 'Kalahari'}) scores saved and leaderboard updated!`);
    if (activeMatchRound < 3) setActiveMatchRound(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-panther-950 text-gray-100 flex flex-col font-sans selection:bg-flame-500 selection:text-white">
      {/* 1. TOP OPERATIONS COMMAND BAR */}
      <header className="sticky top-0 z-50 bg-panther-950/95 backdrop-blur-md border-b border-panther-800 shadow-xl">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Brand & Console Identity */}
          <div className="flex items-center gap-3">
            <img src="/panther-logo.svg" alt="Panther" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,77,0,0.5)]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-black text-sm tracking-wider text-white">
                  PANTHERS ESPORTS
                </span>
                <span className="bg-red-950 text-red-400 border border-red-600/60 text-[9px] font-orbitron font-bold px-1.5 py-0.2 rounded uppercase">
                  STAFF OPS HUB
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Real-Time Engine Active • {currentTime} IST
              </span>
            </div>
          </div>

          {/* Active Tournament Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-panther-900 border border-panther-800 px-3 py-1.5 rounded clip-hud-sm">
            <span className="text-gray-400 text-xs font-rajdhani hidden xl:inline">Event:</span>
            <select
              value={activeTournament?.id || ''}
              onChange={(e) => setSelectedTourneyId(e.target.value)}
              className="bg-panther-950 text-amber-gold font-rajdhani font-bold text-xs uppercase px-2 py-1 rounded border border-panther-700 focus:outline-none focus:border-flame-500 cursor-pointer max-w-[170px] sm:max-w-[240px] truncate"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id} className="bg-panther-950 text-white">
                  {t.name} ({t.status.toUpperCase()})
                </option>
              ))}
            </select>
            {activeTournament && <Badge status={activeTournament.status} size="sm" />}
          </div>

          {/* Direct Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-rajdhani font-bold uppercase bg-gradient-to-r from-flame-500 to-amber-gold hover:from-flame-600 hover:to-amber-500 text-white shadow-flame-sm transition-all hover:scale-105"
              title="Host and Announce a New Event or Tournament"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Announce Event</span>
              <span className="sm:hidden">+ Event</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAnnouncement}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-rajdhani font-bold uppercase bg-panther-850 hover:bg-panther-800 text-gray-200 border border-panther-700 hover:border-flame-500/50 transition-colors"
              title="Copy formatted WhatsApp / Discord announcement"
            >
              <Copy className="w-3.5 h-3.5 text-flame-400" />
              <span>{copiedAnnouncement ? 'Copied!' : 'Copy Room Pass'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-rajdhani font-bold uppercase bg-panther-850 hover:bg-panther-800 text-gray-200 border border-panther-700 hover:border-amber-gold/50 transition-colors"
              title="Print referee lineup sheet"
            >
              <Printer className="w-3.5 h-3.5 text-amber-gold" />
              <span>Print Sheet</span>
            </button>

            <Button
              size="sm"
              variant="outline"
              onClick={onExitToPublic}
              icon={ArrowLeft}
            >
              Public Site
            </Button>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* SIDEBAR NAVIGATION RAIL */}
        <aside className="w-full md:w-64 bg-panther-900 border-r border-panther-800/80 p-3 space-y-1 flex-shrink-0">
          <div className="px-3 py-2 text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest">
            Control Navigation
          </div>

          {[
            { id: 'dashboard', label: 'Operations Hub', icon: LayoutDashboard, badge: `${occupancyPercent}%` },
            { id: 'events', label: 'Events & Broadcast', icon: Megaphone, count: tournaments.length },
            { id: 'slots', label: `${activeTournament?.total_slots || 12}-Slot Commander`, icon: Grid3X3, count: bookedSlots.length },
            { 
              id: 'payments', 
              label: 'UTR & Approvals', 
              icon: IndianRupee, 
              count: pendingApprovalsCount,
              alert: pendingApprovalsCount > 0 
            },
            { id: 'room', label: 'Custom Room Dispatch', icon: Key, active: Boolean(roomId) },
            { id: 'scoring', label: '3-Match Scoring', icon: Trophy },
            { id: 'teams', label: 'Teams & Lineups', icon: Users, count: teams.length },
            { id: 'audit', label: 'Audit Trail', icon: Terminal, count: adminLogs.length },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded font-rajdhani font-bold text-xs uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-flame-500/20 to-panther-850 text-white border-l-4 border-flame-500 shadow-[0_0_12px_rgba(255,77,0,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-panther-850/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-flame-400' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-gold/20 text-amber-gold text-[10px] px-1.5 py-0.2 rounded font-mono">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && (
                  <span className="bg-panther-800 text-gray-400 text-[10px] px-1.5 py-0.2 rounded font-mono">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Match Status Widget in Sidebar */}
          <div className="pt-4 mt-4 border-t border-panther-800/80 px-2 space-y-2">
            <span className="text-[10px] font-orbitron font-bold text-gray-400 uppercase tracking-widest block">
              Match Status
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => updateTournamentStatus(activeTournament.id, 'upcoming')}
                className={`py-1 text-[10px] font-rajdhani font-bold rounded uppercase ${
                  activeTournament.status === 'upcoming'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-panther-950 text-gray-400 border border-panther-800'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => updateTournamentStatus(activeTournament.id, 'live')}
                className={`py-1 text-[10px] font-rajdhani font-bold rounded uppercase ${
                  activeTournament.status === 'live'
                    ? 'bg-red-950 text-red-400 border border-red-600 animate-pulse'
                    : 'bg-panther-950 text-gray-400 border border-panther-800'
                }`}
              >
                LIVE
              </button>
              <button
                onClick={() => updateTournamentStatus(activeTournament.id, 'completed')}
                className={`py-1 text-[10px] font-rajdhani font-bold rounded uppercase ${
                  activeTournament.status === 'completed'
                    ? 'bg-panther-800 text-gray-200 border border-panther-600'
                    : 'bg-panther-950 text-gray-400 border border-panther-800'
                }`}
              >
                Ended
              </button>
            </div>
          </div>
        </aside>

        {/* 3. WORKSPACE / MAIN VIEW AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* SECTION A: OPERATIONS HUB / DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Event Title Banner */}
              <div className="bg-gradient-to-r from-panther-900 via-panther-850 to-panther-900 border border-panther-800 p-5 rounded clip-hud flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card-dark">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={activeTournament.status} size="sm" />
                    <span className="text-xs font-rajdhani font-bold text-flame-400 uppercase">
                      12-Slot Competitive BR Series
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase">
                    {activeTournament.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    3 Back-to-Back Matches: Bermuda ➔ Purgatory ➔ Kalahari • Esports Rules Only
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveSection('slots')}
                    icon={Grid3X3}
                  >
                    Open Slot Matrix ({openSlots.length} Open)
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveSection('scoring')}
                    icon={Trophy}
                  >
                    Enter Scores
                  </Button>
                </div>
              </div>

              {/* 4 Essential KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Slot Occupancy */}
                <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-rajdhani font-bold text-gray-400 uppercase">
                    <span>Slot Occupancy</span>
                    <span className="text-flame-400">{occupancyPercent}% Filled</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-orbitron font-black text-white">
                      {bookedSlots.length}
                    </span>
                    <span className="text-xs font-mono text-gray-400">/ {totalSlotsCount} Slots</span>
                  </div>
                  <div className="w-full h-1.5 bg-panther-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-flame-600 to-flame-400 rounded-full"
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-emerald-400 block font-rajdhani">
                    {openSlots.length} slots still open for registration
                  </span>
                </div>

                {/* 2. Revenue Collection */}
                <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-rajdhani font-bold text-gray-400 uppercase">
                    <span>Entry Collection</span>
                    <span className="text-amber-gold">₹{entryFee}/slot</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-orbitron font-black text-gold-gradient">
                      ₹{totalRevenueCollected}
                    </span>
                    <span className="text-xs font-mono text-gray-400">/ ₹{totalPotentialRevenue}</span>
                  </div>
                  <div className="w-full h-1.5 bg-panther-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-600 to-amber-gold rounded-full"
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 block font-rajdhani">
                    {bookedSlots.length} registered entry fees
                  </span>
                </div>

                {/* 3. Prize Guarantee */}
                <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-rajdhani font-bold text-gray-400 uppercase">
                    <span>Prize Pool</span>
                    <span className="text-emerald-400">Guaranteed</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-orbitron font-black text-white">
                      ₹{activeTournament.prize_pool}
                    </span>
                    <span className="text-xs font-mono text-gray-400">Total</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-rajdhani font-bold text-gray-300 pt-1">
                    <span className="text-amber-gold">1st: ₹200</span>
                    <span className="text-slate-300">2nd: ₹130</span>
                    <span className="text-amber-600">3rd: ₹70</span>
                  </div>
                </div>

                {/* 4. Check-in Readiness */}
                <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-rajdhani font-bold text-gray-400 uppercase">
                    <span>Lobby Check-ins</span>
                    <span className="text-cyan-400">{checkedInSlots.length}/{bookedSlots.length} Ready</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-orbitron font-black text-cyan-300">
                      {checkedInSlots.length}
                    </span>
                    <span className="text-xs font-mono text-gray-400">Verified</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => bulkCheckInSlots(activeTournament.id)}
                      className="text-[10px] font-rajdhani font-bold text-cyan-400 hover:underline uppercase"
                    >
                      ✓ 1-Click Check-In All
                    </button>
                    <span className="text-[10px] font-mono text-gray-500">
                      Room ID: {roomId || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Matches Timeline Schedule Box */}
              <div className="bg-panther-900 border border-panther-800 p-5 rounded clip-hud space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-flame-400" />
                    3 Back-to-Back Matches Timeline
                  </h3>
                  <span className="text-xs font-rajdhani text-gray-400">
                    Official Free Fire Esports Rotation
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-panther-950 p-4 rounded border border-amber-gold/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-orbitron font-black text-amber-gold">MATCH 1</span>
                      <span className="text-xs font-mono text-gray-400">19:00 IST</span>
                    </div>
                    <h4 className="text-lg font-orbitron font-bold text-white">Bermuda</h4>
                    <p className="text-xs text-gray-400">Opening skirmish across Clock Tower & Factory.</p>
                  </div>

                  <div className="bg-panther-950 p-4 rounded border border-flame-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-orbitron font-black text-flame-400">MATCH 2</span>
                      <span className="text-xs font-mono text-gray-400">19:45 IST</span>
                    </div>
                    <h4 className="text-lg font-orbitron font-bold text-white">Purgatory</h4>
                    <p className="text-xs text-gray-400">Mid-series clash around Brasilia & Moathouse.</p>
                  </div>

                  <div className="bg-panther-950 p-4 rounded border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-orbitron font-black text-cyan-400">MATCH 3</span>
                      <span className="text-xs font-mono text-gray-400">20:30 IST</span>
                    </div>
                    <h4 className="text-lg font-orbitron font-bold text-white">Kalahari</h4>
                    <p className="text-xs text-gray-400">Championship finale through Refinery & Command Post.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: EVENTS & LIVE BROADCAST COMMANDER */}
          {activeSection === 'events' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Quick Action */}
              <div className="bg-gradient-to-r from-panther-900 via-panther-850 to-panther-900 border border-panther-800 p-5 rounded clip-hud flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card-dark">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-flame-950 text-flame-400 border border-flame-600/60 text-[9px] font-orbitron font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <Megaphone className="w-2.5 h-2.5" />
                      Broadcast & Season Commander
                    </span>
                    <span className="text-xs font-mono text-gray-400">
                      {tournaments.length} Registered Events
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-orbitron font-black text-white uppercase tracking-wide">
                    Events & Broadcast Hub
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Announce new tournaments, schedule competitive seasons, and broadcast instant ticker notices across the player platform.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-rajdhani font-bold uppercase bg-gradient-to-r from-flame-500 to-amber-gold hover:from-flame-600 hover:to-amber-500 text-white shadow-flame-md transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Announce New Event</span>
                  </button>
                </div>
              </div>

              {/* 1. TOP DUAL CONSOLE: LIVE NOTICE BROADCASTER + 1-CLICK SHARE GENERATOR */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Live Public Announcement Ticker ("or anything") */}
                <div className="lg:col-span-7 bg-panther-900 border border-panther-800 rounded clip-hud p-5 space-y-4 shadow-card-dark relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-panther-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-flame-400 animate-pulse" />
                      <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                        Live Public Website Announcement
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-600/50 px-2 py-0.5 rounded uppercase">
                      Instant Sync
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Post any urgent notice, slot availability update, room credentials alert, or prize ceremony news. It immediately appears as an animated top banner on the public player website.
                  </p>

                  <form onSubmit={handleSaveNotice} className="space-y-3">
                    <div>
                      <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                        Announcement Text *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 🔥 REGISTRATION OPEN FOR SUNDAY 9PM TRI-MAP — ONLY 4 SLOTS LEFT!"
                        value={broadcastNoticeText}
                        onChange={(e) => setBroadcastNoticeText(e.target.value)}
                        className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white font-rajdhani font-semibold focus:outline-none focus:border-flame-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                          Banner Urgency Style
                        </label>
                        <select
                          value={broadcastNoticeType}
                          onChange={(e) => setBroadcastNoticeType(e.target.value)}
                          className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-rajdhani font-bold focus:outline-none focus:border-flame-500"
                        >
                          <option value="flame">🔥 Flame (Urgent / High Priority)</option>
                          <option value="emerald">🟢 Emerald (Verified / Passwords)</option>
                          <option value="amber">⚠️ Amber (Notice / Schedule)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                          Optional Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. #/tournaments or https://..."
                          value={broadcastNoticeLink}
                          onChange={(e) => setBroadcastNoticeLink(e.target.value)}
                          className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-flame-500"
                        />
                      </div>
                    </div>

                    {/* Live Preview Bar */}
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
                        Live Preview on Player Website:
                      </span>
                      <div className={`p-2 rounded border text-xs font-rajdhani font-bold flex items-center justify-between gap-2 ${
                        broadcastNoticeType === 'emerald'
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                          : broadcastNoticeType === 'amber'
                          ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                          : 'bg-gradient-to-r from-red-950/90 via-flame-950/90 to-red-950/90 text-white border-flame-500/60'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <span className="bg-flame-500 text-white text-[9px] font-orbitron font-black px-1.5 py-0.5 rounded uppercase animate-pulse">
                            BROADCAST
                          </span>
                          <span className="truncate">{broadcastNoticeText || 'Your announcement will appear here in real-time...'}</span>
                        </div>
                        <span className="text-[10px] text-flame-400 flex-shrink-0">Preview</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={broadcastNoticeActive}
                          onChange={(e) => setBroadcastNoticeActive(e.target.checked)}
                          className="rounded border-panther-700 text-flame-500 focus:ring-0 bg-panther-950"
                        />
                        <span className="text-xs font-rajdhani font-bold text-gray-300 uppercase">
                          Display Banner Active
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        {broadcastNoticeText && (
                          <button
                            type="button"
                            onClick={handleClearNotice}
                            className="px-3 py-1.5 rounded text-xs font-rajdhani font-bold uppercase text-gray-400 hover:text-red-400 bg-panther-950 border border-panther-800 transition-colors"
                          >
                            Take Down Banner
                          </button>
                        )}
                        <Button size="sm" variant="primary" type="submit" icon={CheckCircle2}>
                          {noticeSaved ? 'Broadcast Published!' : 'Publish to Website'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Right: 1-Click Social Media Broadcast Generator */}
                <div className="lg:col-span-5 bg-panther-900 border border-panther-800 rounded clip-hud p-5 space-y-4 shadow-card-dark flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-panther-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-amber-gold" />
                        <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                          1-Click Social Broadcast
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase truncate max-w-[130px]">
                        {activeTournament?.name}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                      Instantly generate formatted copy ready to paste directly into WhatsApp squads or Discord announcements channels.
                    </p>

                    {/* Previews & Copy Buttons */}
                    <div className="space-y-2">
                      <div className="bg-panther-950 p-3 rounded border border-panther-800 text-[11px] font-mono text-gray-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {eventInviteText}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyInvite}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-rajdhani font-bold uppercase bg-gradient-to-r from-amber-500/20 to-flame-500/20 text-amber-gold border border-amber-500/50 hover:border-amber-400 transition-all hover:scale-[1.01]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedInvite ? 'Copied Invitation to Clipboard!' : '1-Click Copy WhatsApp Registration Invite'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyAnnouncement}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-rajdhani font-bold uppercase bg-panther-850 hover:bg-panther-800 text-gray-300 border border-panther-700 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5 text-flame-400" />
                        <span>{copiedAnnouncement ? 'Copied Room Pass!' : 'Copy Room Pass & Rules Broadcast'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-panther-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Target Event: <strong className="text-white uppercase">{activeTournament?.name}</strong></span>
                    <Badge status={activeTournament?.status || 'upcoming'} size="sm" />
                  </div>
                </div>
              </div>

              {/* 2. TOURNAMENTS & EVENTS DIRECTORY */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-flame-400" />
                    <h3 className="font-orbitron font-bold text-base text-white uppercase tracking-wide">
                      All Registered Tournaments ({tournaments.length})
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-rajdhani font-semibold">
                    Click any event to inspect slots, approve UTR payments, or dispatch custom room credentials.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournaments.map((tourney) => {
                    const isSelected = tourney.id === activeTournament?.id;
                    const tourneySlotsList = slots.filter(s => s.tournament_id === tourney.id);
                    const bookedCount = tourneySlotsList.filter(s => s.status === 'booked' || s.team_id).length;
                    const totalSlots = tourney.total_slots || 12;
                    const percent = Math.round((bookedCount / totalSlots) * 100);

                    return (
                      <div
                        key={tourney.id}
                        className={`bg-panther-900 border rounded clip-hud p-4 space-y-3 transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-flame-500 shadow-[0_0_15px_rgba(255,77,0,0.2)] bg-gradient-to-b from-panther-900 to-panther-850'
                            : 'border-panther-800 hover:border-panther-700'
                        }`}
                      >
                        <div>
                          {/* Banner & Badge */}
                          <div className="relative h-28 rounded overflow-hidden mb-3 border border-panther-800">
                            <img
                              src={tourney.banner_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'}
                              alt={tourney.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-panther-950 via-transparent to-transparent" />
                            <div className="absolute top-2 left-2">
                              <Badge status={tourney.status} size="sm" />
                            </div>
                            <div className="absolute top-2 right-2 bg-panther-950/90 border border-panther-700 text-amber-gold font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                              ₹{tourney.prize_pool} PRIZE
                            </div>
                            <div className="absolute bottom-2 left-2 text-[10px] font-rajdhani font-bold uppercase text-gray-300">
                              {tourney.mode} • {tourney.map}
                            </div>
                          </div>

                          <h4 className="font-orbitron font-bold text-sm text-white uppercase line-clamp-1">
                            {tourney.name}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-gray-400 font-rajdhani mt-1">
                            <span>📅 {tourney.date}</span>
                            <span>⏰ {tourney.time} IST</span>
                            <span>🎟️ {tourney.entry_fee ? `₹${tourney.entry_fee}` : 'FREE'}</span>
                          </div>

                          {/* Occupancy Progress */}
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-gray-400">Slot Occupancy:</span>
                              <span className="text-amber-gold font-bold">{bookedCount}/{totalSlots} ({percent}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-panther-950 rounded-full overflow-hidden border border-panther-800">
                              <div
                                className="h-full bg-gradient-to-r from-flame-500 to-amber-gold transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Event Card Actions */}
                        <div className="pt-3 border-t border-panther-800/80 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTourneyId(tourney.id);
                              setActiveSection('slots');
                            }}
                            className={`flex-1 py-1.5 px-2 rounded text-xs font-rajdhani font-bold uppercase transition-colors flex items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-flame-500 hover:bg-flame-600 text-white shadow-flame-sm'
                                : 'bg-panther-800 hover:bg-panther-700 text-gray-200'
                            }`}
                          >
                            <span>Manage Slots</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Status cycle button */}
                          <button
                            type="button"
                            title="Cycle status: upcoming -> live -> completed"
                            onClick={() => {
                              const nextStatus = tourney.status === 'upcoming' ? 'live' : (tourney.status === 'live' ? 'completed' : 'upcoming');
                              updateTournamentStatus(tourney.id, nextStatus, user?.displayName || 'StaffAdmin');
                            }}
                            className="px-2 py-1.5 rounded text-[10px] font-mono uppercase bg-panther-950 hover:bg-panther-800 text-gray-300 border border-panther-800"
                          >
                            {tourney.status}
                          </button>

                          {/* Delete option if not active */}
                          {tournaments.length > 1 && (
                            <button
                              type="button"
                              title="Delete Tournament"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete tournament "${tourney.name}"? This action cannot be undone.`)) {
                                  deleteTournament(tourney.id, user?.displayName || 'StaffAdmin');
                                  if (selectedTourneyId === tourney.id) {
                                    const remaining = tournaments.filter(t => t.id !== tourney.id);
                                    if (remaining[0]) setSelectedTourneyId(remaining[0].id);
                                  }
                                }
                              }}
                              className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {activeSection === 'slots' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Controls Toolbar */}
              <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search slot #, squad name, tag, captain, or FF UID..."
                      value={slotSearch}
                      onChange={(e) => setSlotSearch(e.target.value)}
                      className="w-full bg-panther-950 border border-panther-700 rounded pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-flame-500 font-rajdhani font-semibold"
                    />
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => bulkCheckInSlots(activeTournament.id)}
                    >
                      ✓ Check In All ({bookedSlots.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm('Free all slots that are booked but not yet checked in?')) {
                          bulkFreeUncheckedSlots(activeTournament.id);
                        }
                      }}
                    >
                      Free Unchecked
                    </Button>
                    <div className="flex items-center border border-panther-700 rounded overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-2.5 py-1 text-xs font-rajdhani font-bold ${
                          viewMode === 'grid' ? 'bg-flame-500 text-white' : 'bg-panther-950 text-gray-400'
                        }`}
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-2.5 py-1 text-xs font-rajdhani font-bold ${
                          viewMode === 'table' ? 'bg-flame-500 text-white' : 'bg-panther-950 text-gray-400'
                        }`}
                      >
                        Table
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 border-t border-panther-800/80 pt-3 text-xs font-rajdhani font-bold">
                  <span className="text-gray-400">Filter By Status:</span>
                  {[
                    { id: 'ALL', label: `All ${totalSlotsCount} Slots (${tourneySlots.length})` },
                    { id: 'OPEN', label: `Available Open (${openSlots.length})` },
                    { id: 'BOOKED', label: `Booked (${bookedSlots.length})` },
                    { id: 'CHECKED_IN', label: `Checked In (${checkedInSlots.length})` },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSlotFilter(f.id)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        slotFilter === f.id
                          ? 'bg-amber-gold text-panther-950 font-black shadow-gold-glow'
                          : 'bg-panther-950 text-gray-400 hover:text-white border border-panther-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredSlots.map(slot => {
                    const team = slot.virtualTeam || (slot.team_id ? getTeamById(slot.team_id) : null);
                    const isOpen = slot.status === 'open';
                    const isCheckedIn = slot.status === 'checked_in';
                    const isPending = slot.status === 'pending_verification';

                    return (
                      <div
                        key={slot.id || `slot-${slot.slot_number}`}
                        className={`p-3 rounded clip-hud-sm flex flex-col justify-between min-h-[140px] border transition-all ${
                          isOpen
                            ? 'bg-panther-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                            : isPending
                            ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            : isCheckedIn
                            ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                            : 'bg-panther-900 border-flame-600/40'
                        }`}
                      >
                        {/* Slot Header */}
                        <div className="flex items-start justify-between">
                          <span className="text-2xl font-orbitron font-black text-white">
                            #{String(slot.slot_number).padStart(2, '0')}
                          </span>
                          <Badge status={slot.status} size="sm" />
                        </div>

                        {/* Middle Info */}
                        <div className="my-2">
                          {team ? (
                            <div>
                              <span className="bg-panther-800 text-flame-400 text-[10px] font-orbitron font-bold px-1 py-0.2 rounded">
                                {team.tag}
                              </span>
                              <p className="text-xs font-rajdhani font-bold text-gray-200 truncate mt-1">
                                {team.name}
                              </p>
                              <p className="text-[10px] text-amber-gold font-mono truncate">
                                UID: {team.captain_uid || '—'}
                              </p>
                              {isPending && slot.registration?.payment?.utr && (
                                <p className="text-[9px] text-amber-300/80 font-mono truncate">
                                  UTR: {slot.registration.payment.utr}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 italic">Empty Slot</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-panther-800 flex items-center justify-between gap-1">
                          {isOpen ? (
                            <button
                              type="button"
                              onClick={() => setAllottingSlotNum(slot.slot_number)}
                              className="w-full py-1 px-2 rounded bg-flame-500/20 hover:bg-flame-500/30 text-flame-400 border border-flame-500/40 text-[10px] font-orbitron font-bold uppercase transition-all flex items-center justify-center gap-1"
                              title="Assign squad or enter team details manually"
                            >
                              <span>+ Allot Slot</span>
                            </button>
                          ) : isPending ? (
                            <div className="flex items-center justify-between w-full gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveSection('payments');
                                  setRegSearch(team?.name || String(slot.slot_number));
                                }}
                                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-[9px] uppercase tracking-wider transition-colors"
                                title="Review UTR payment & approve"
                              >
                                Verify UTR ➔
                              </button>
                              <button
                                onClick={() => setInspectingTeam(team)}
                                className="p-1 text-gray-400 hover:text-amber-gold"
                                title="Inspect Full Roster"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Free Slot #${slot.slot_number}?`)) {
                                    freeSlot(activeTournament.id, slot.slot_number);
                                  }
                                }}
                                className="p-1 text-gray-500 hover:text-red-400"
                                title="Kick / Free Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => checkInSlot(activeTournament.id, slot.slot_number)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                  isCheckedIn ? 'bg-cyan-600 text-white' : 'bg-panther-800 text-gray-300 hover:text-cyan-400'
                                }`}
                              >
                                {isCheckedIn ? 'Checked ✓' : 'Check In'}
                              </button>
                              <button
                                onClick={() => setInspectingTeam(team)}
                                className="p-1 text-gray-400 hover:text-amber-gold"
                                title="Inspect Full Roster"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Free Slot #${slot.slot_number}?`)) {
                                    freeSlot(activeTournament.id, slot.slot_number);
                                  }
                                }}
                                className="p-1 text-gray-500 hover:text-red-400"
                                title="Kick / Free Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-rajdhani">
                      <thead>
                        <tr className="bg-panther-850 border-b border-panther-800 text-gray-400 uppercase text-[10px] font-orbitron">
                          <th className="p-3 w-16 text-center">Slot</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Squad Name</th>
                          <th className="p-3">Captain Name</th>
                          <th className="p-3">Captain UID</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-panther-800/80 font-semibold">
                        {filteredSlots.map(slot => {
                          const team = slot.virtualTeam || (slot.team_id ? getTeamById(slot.team_id) : null);
                          const isOpen = slot.status === 'open';
                          const isPending = slot.status === 'pending_verification';

                          return (
                            <tr key={slot.id} className="hover:bg-panther-850/60 transition-colors">
                              <td className="p-3 text-center font-orbitron font-black text-sm text-white">
                                #{String(slot.slot_number).padStart(2, '0')}
                              </td>
                              <td className="p-3">
                                <Badge status={slot.status} size="sm" />
                              </td>
                              <td className="p-3">
                                {team ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-panther-800 text-flame-400 font-orbitron font-bold text-[9px] px-1.5 py-0.2 rounded">
                                      {team.tag}
                                    </span>
                                    <span className="font-bold text-white">{team.name}</span>
                                    {isPending && (
                                      <span className="text-[9px] text-amber-400 font-mono">
                                        (UTR: {slot.registration?.payment?.utr || 'Pending'})
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic">Available</span>
                                )}
                              </td>
                              <td className="p-3 text-gray-300">
                                {team?.captain_name || '—'}
                              </td>
                              <td className="p-3 font-mono text-amber-gold">
                                {team?.captain_uid || '—'}
                              </td>
                              <td className="p-3 font-mono text-gray-400">
                                {team?.captain_phone || '—'}
                              </td>
                              <td className="p-3 text-right">
                                {isOpen ? (
                                  <button
                                    onClick={() => setAllottingSlotNum(slot.slot_number)}
                                    className="px-2 py-1 rounded bg-flame-500/20 hover:bg-flame-500/30 text-flame-400 border border-flame-500/40 text-[10px] font-orbitron font-bold uppercase"
                                  >
                                    + Allot Slot
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isPending ? (
                                      <button
                                        onClick={() => {
                                          setActiveSection('payments');
                                          setRegSearch(team?.name || String(slot.slot_number));
                                        }}
                                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase"
                                      >
                                        Verify UTR
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => checkInSlot(activeTournament.id, slot.slot_number)}
                                        className="px-2 py-0.5 rounded bg-panther-800 text-gray-300 hover:text-cyan-400 text-[10px]"
                                      >
                                        {slot.status === 'checked_in' ? 'Checked ✓' : 'Check In'}
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setInspectingTeam(team)}
                                      className="p-1 text-gray-400 hover:text-amber-gold"
                                      title="Inspect Lineup"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => freeSlot(activeTournament.id, slot.slot_number)}
                                      className="p-1 text-gray-500 hover:text-red-400"
                                      title="Free Slot"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION C: CUSTOM ROOM DISPATCH */}
          {activeSection === 'room' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
              {/* Left: Input Credentials */}
              <div className="lg:col-span-6 bg-panther-900 border border-panther-800 p-6 rounded clip-hud space-y-4">
                <div className="flex items-center gap-2 border-b border-panther-800 pb-3">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white uppercase">
                      In-Game Custom Room Credentials
                    </h3>
                    <p className="text-xs text-gray-400">
                      Credentials are automatically revealed to all registered players on their pass.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                      Free Fire Custom Room ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8821941"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                      Room Password *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PANTHERS_ESPORTS"
                      value={roomPassword}
                      onChange={(e) => setRoomPassword(e.target.value)}
                      className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-amber-gold font-mono font-bold focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {broadcastSuccess && (
                    <div className="bg-emerald-950/80 border border-emerald-500/60 p-2.5 rounded text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Room credentials saved & live broadcasted!</span>
                    </div>
                  )}

                  <Button type="submit" variant="cyan" className="w-full justify-center" icon={Send}>
                    Broadcast Room Credentials to Players
                  </Button>
                </form>
              </div>

              {/* Right: WhatsApp / Discord Message Formatter */}
              <div className="lg:col-span-6 bg-panther-900 border border-panther-800 p-6 rounded clip-hud space-y-4">
                <div className="flex items-center justify-between border-b border-panther-800 pb-3">
                  <h3 className="font-orbitron font-bold text-sm text-white uppercase flex items-center gap-2">
                    <Copy className="w-4 h-4 text-flame-400" />
                    WhatsApp / Discord Announcement Template
                  </h3>
                  <button
                    onClick={handleCopyAnnouncement}
                    className="text-xs font-rajdhani font-bold text-flame-400 hover:text-flame-300 uppercase flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedAnnouncement ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="bg-panther-950 p-4 rounded border border-panther-800 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {announcementText}
                </div>

                <Button
                  variant="primary"
                  onClick={handleCopyAnnouncement}
                  className="w-full justify-center"
                  icon={Copy}
                >
                  {copiedAnnouncement ? 'Copied to Clipboard!' : '1-Click Copy Tournament Broadcast'}
                </Button>
              </div>
            </div>
          )}

          {/* SECTION D: 3-MATCH SCORING CONSOLE */}
          {activeSection === 'scoring' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Round Selector Bar */}
              <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-orbitron font-black text-base text-white uppercase flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-gold" />
                    Official Free Fire Scoring Console
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    12-Point Placement Table + 1 Point Per Kill. Auto-aggregates across all 3 matches.
                  </p>
                </div>

                {/* Match Tabs */}
                <div className="flex items-center gap-2 bg-panther-950 p-1 rounded border border-panther-800">
                  <button
                    onClick={() => setActiveMatchRound(1)}
                    className={`px-3 py-1.5 rounded text-xs font-orbitron font-bold transition-all ${
                      activeMatchRound === 1 ? 'bg-amber-gold text-panther-950 shadow-gold-glow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Match 1: Bermuda
                  </button>
                  <button
                    onClick={() => setActiveMatchRound(2)}
                    className={`px-3 py-1.5 rounded text-xs font-orbitron font-bold transition-all ${
                      activeMatchRound === 2 ? 'bg-flame-500 text-white shadow-flame-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Match 2: Purgatory
                  </button>
                  <button
                    onClick={() => setActiveMatchRound(3)}
                    className={`px-3 py-1.5 rounded text-xs font-orbitron font-bold transition-all ${
                      activeMatchRound === 3 ? 'bg-cyan-500 text-panther-950 shadow-cyan-glow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Match 3: Kalahari
                  </button>
                </div>
              </div>

              {scoreError && (
                <div className="bg-red-950/80 border border-red-500 p-3 rounded clip-hud-sm text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{scoreError}</span>
                </div>
              )}

              {scoreSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-500 p-3 rounded clip-hud-sm text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{scoreSuccess}</span>
                </div>
              )}

              {/* Scoring Form */}
              <form onSubmit={handlePublishRoundScores} className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden shadow-card-dark">
                <div className="p-4 border-b border-panther-800 flex items-center justify-between">
                  <span className="font-orbitron font-bold text-xs text-white uppercase">
                    Entering Standings for: Match {activeMatchRound} ({activeMatchRound === 1 ? 'Bermuda' : activeMatchRound === 2 ? 'Purgatory' : 'Kalahari'})
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    {roundScores.length} Squads in Competition
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-rajdhani">
                    <thead>
                      <tr className="bg-panther-850 border-b border-panther-800 text-[10px] font-orbitron font-bold text-gray-400 uppercase">
                        <th className="p-3">Slot & Squad</th>
                        <th className="p-3 text-center w-28">Placement Rank</th>
                        <th className="p-3 text-center w-28">Placement Pts</th>
                        <th className="p-3 text-center w-28">Kills</th>
                        <th className="p-3 text-center w-28">Kill Pts</th>
                        <th className="p-3 text-center w-28">Total Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-panther-800/80 font-semibold">
                      {roundScores.map(row => {
                        const score = calculateMatchScore(row.placement, row.kills);
                        return (
                          <tr key={row.team_id} className={`hover:bg-panther-850/60 transition-colors ${row.placement === 1 ? 'bg-amber-950/20' : ''}`}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-gray-500 text-[10px]">
                                  #{String(row.slot_number).padStart(2, '0')}
                                </span>
                                <span className="bg-panther-800 text-flame-400 font-orbitron text-[9px] font-bold px-1.5 py-0.2 rounded">
                                  {row.team_tag}
                                </span>
                                <span className="font-bold text-white text-sm">{row.team_name}</span>
                                {row.placement === 1 && (
                                  <span className="text-amber-gold font-orbitron text-[10px] uppercase font-black bg-amber-950/80 border border-amber-gold/40 px-1.5 py-0.2 rounded">
                                    👑 BOOYAH
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={1}
                                max={12}
                                required
                                value={row.placement}
                                onChange={(e) => handleScoreChange(row.team_id, 'placement', e.target.value)}
                                className="w-16 bg-panther-950 border border-panther-700 rounded px-2 py-1 text-center font-orbitron font-bold text-white focus:outline-none focus:border-flame-500"
                              />
                            </td>

                            <td className="p-3 text-center font-mono text-gray-300">
                              +{score.placementPoints}
                            </td>

                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={50}
                                required
                                value={row.kills}
                                onChange={(e) => handleScoreChange(row.team_id, 'kills', e.target.value)}
                                className="w-16 bg-panther-950 border border-panther-700 rounded px-2 py-1 text-center font-mono text-amber-gold font-bold focus:outline-none focus:border-flame-500"
                              />
                            </td>

                            <td className="p-3 text-center font-mono text-gray-300">
                              +{score.killPoints}
                            </td>

                            <td className="p-3 text-center font-orbitron font-black text-sm text-flame-400">
                              {score.totalPoints} PTS
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t border-panther-800 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Auto updates tournament leaderboard and calculates top 3 prize winners
                  </span>
                  <Button type="submit" variant="primary" icon={Trophy}>
                    Publish Match {activeMatchRound} Results & Update Leaderboards
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION E: TEAMS & ROSTERS DIRECTORY */}
          {activeSection === 'teams' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron font-bold text-sm text-white uppercase">
                    Clans & Verified Lineup Directory ({teams.length})
                  </h3>
                  <p className="text-xs text-gray-400">Inspect player UIDs and captain contacts for verification.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                  <div key={team.id} className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-panther-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-panther-800 text-flame-400 font-orbitron font-bold text-xs px-2 py-0.5 rounded">
                          {team.tag}
                        </span>
                        <h4 className="font-bold text-white text-sm">{team.name}</h4>
                      </div>
                      <button
                        onClick={() => setInspectingTeam(team)}
                        className="text-xs text-amber-gold font-rajdhani font-bold hover:underline"
                      >
                        Inspect Lineup
                      </button>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Captain:</span>
                        <span className="text-white font-bold">{team.captain_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Captain UID:</span>
                        <span className="font-mono text-amber-gold">{team.captain_uid}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span>Contact:</span>
                        <span className="font-mono text-gray-300">{team.captain_phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION E2: PAYMENT VERIFICATION */}
          {/* ========================================================================= */}
          {/* 5. UTR PAYMENT VERIFICATION & REGISTRATION APPROVAL CONSOLE (FIREBASE)    */}
          {/* ========================================================================= */}
          {activeSection === 'payments' && (() => {

            // Filter
            const filteredRegs = allRegistrations.filter(r => {
              const matchesFilter =
                regFilter === 'ALL' ||
                (regFilter === 'PENDING' && (r.status === 'pending' || r.status === 'pending_verification')) ||
                (regFilter === 'ACCEPTED' && (r.status === 'accepted' || r.status === 'verified')) ||
                (regFilter === 'REJECTED' && r.status === 'rejected');

              const search = regSearch.toLowerCase().trim();
              const matchesSearch =
                !search ||
                (r.utr && r.utr.toLowerCase().includes(search)) ||
                (r.team_name && r.team_name.toLowerCase().includes(search)) ||
                (r.team_tag && r.team_tag.toLowerCase().includes(search)) ||
                (r.captain_phone && r.captain_phone.includes(search)) ||
                (r.captain_uid && r.captain_uid.includes(search)) ||
                String(r.slot_number).includes(search);

              return matchesFilter && matchesSearch;
            });

            const pendingCount = allRegistrations.filter(r => r.status === 'pending' || r.status === 'pending_verification').length;
            const acceptedCount = allRegistrations.filter(r => r.status === 'accepted' || r.status === 'verified').length;
            const rejectedCount = allRegistrations.filter(r => r.status === 'rejected').length;

            const handleCopyUtr = (utrNumber) => {
              navigator.clipboard.writeText(utrNumber).catch(() => {});
              setCopiedUtr(utrNumber);
              setTimeout(() => setCopiedUtr(null), 2000);
            };

            const handleAccept = async (reg) => {
              setProcessingRegId(reg.id);
              try {
                const res = await approveRegistration(reg.id, user?.in_game_name || 'Admin');
                if (res?.success) {
                  try {
                    confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
                  } catch { /* ignore */ }
                }
              } finally {
                setProcessingRegId(null);
              }
            };

            const handleReject = async (reg) => {
              const reason = window.prompt(
                `Reject registration for [${reg.team_tag}] ${reg.team_name}?\nEnter reason (e.g. UTR not found / Invalid payment):`,
                'Invalid or unverified UTR number'
              );
              if (reason === null) return;
              setProcessingRegId(reg.id);
              try {
                await rejectRegistration(reg.id, reason, user?.in_game_name || 'Admin');
              } finally {
                setProcessingRegId(null);
              }
            };

            return (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Header bar */}
                <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-orbitron font-bold text-base text-white uppercase tracking-wider">
                        Firebase UTR & New Registration Approvals
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 font-rajdhani">
                      Review UPI UTR transaction numbers submitted by athletes. Accept registrations to officially lock their slot and release room credentials.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-rajdhani font-bold flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 rounded clip-hud-sm">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      Firebase Live Sync Active
                    </span>
                    <span className="text-yellow-400 bg-yellow-900/40 border border-yellow-600/50 px-3 py-1.5 rounded">
                      ⏳ Pending: {pendingCount}
                    </span>
                    <span className="text-emerald-400 bg-emerald-900/40 border border-emerald-600/50 px-3 py-1.5 rounded">
                      ✅ Accepted: {acceptedCount}
                    </span>
                  </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-panther-900/90 border border-panther-800 p-3 rounded clip-hud-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Status filter tabs */}
                  <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'ALL', label: `All (${allRegistrations.length})` },
                      { id: 'PENDING', label: `Pending (${pendingCount})`, highlight: pendingCount > 0 },
                      { id: 'ACCEPTED', label: `Accepted (${acceptedCount})` },
                      { id: 'REJECTED', label: `Rejected (${rejectedCount})` }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRegFilter(tab.id)}
                        className={`px-3 py-1.5 rounded text-xs font-rajdhani font-bold uppercase transition-all whitespace-nowrap ${
                          regFilter === tab.id
                            ? 'bg-flame-500 text-white shadow-flame-sm'
                            : tab.highlight
                            ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-600/50 hover:bg-yellow-900'
                            : 'bg-panther-850 text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search UTR, Team, Phone, UID..."
                      value={regSearch}
                      onChange={e => setRegSearch(e.target.value)}
                      className="w-full bg-panther-950 border border-panther-700 rounded pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-flame-500 font-sans"
                    />
                  </div>
                </div>

                {/* Registrations List */}
                <div className="space-y-3">
                  {filteredRegs.length === 0 ? (
                    <div className="bg-panther-900 border border-panther-800 p-10 rounded clip-hud text-center space-y-2">
                      <Shield className="w-10 h-10 text-gray-600 mx-auto" />
                      <p className="font-orbitron text-gray-300 font-bold text-sm">
                        No registrations match the selected filter.
                      </p>
                      <p className="text-xs text-gray-500 font-rajdhani">
                        When players complete the payment step and enter their UTR number, registrations will update here in real-time.
                      </p>
                    </div>
                  ) : (
                    filteredRegs.map((reg) => {
                      const isPending = reg.status === 'pending' || reg.status === 'pending_verification';
                      const isAccepted = reg.status === 'accepted' || reg.status === 'verified';
                      const isRejected = reg.status === 'rejected';

                      return (
                        <div
                          key={reg.id}
                          className={`bg-panther-900 border rounded clip-hud p-4 transition-all duration-200 ${
                            isPending
                              ? 'border-yellow-600/60 bg-gradient-to-r from-yellow-950/20 to-panther-900 shadow-[0_0_15px_rgba(234,179,8,0.08)]'
                              : isAccepted
                              ? 'border-emerald-600/50 bg-gradient-to-r from-emerald-950/20 to-panther-900'
                              : 'border-red-600/40 bg-gradient-to-r from-red-950/20 to-panther-900 opacity-80'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Left: Slot & Team Details */}
                            <div className="flex items-start gap-3 min-w-[240px]">
                              <div className="w-12 h-12 rounded bg-panther-950 border border-flame-500/40 flex flex-col items-center justify-center flex-shrink-0">
                                <span className="text-[9px] font-mono text-gray-400 uppercase">Slot</span>
                                <span className="font-orbitron font-black text-lg text-flame-400 leading-none">
                                  #{String(reg.slot_number || 1).padStart(2, '0')}
                                </span>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-orbitron font-black text-sm text-white">
                                    {reg.team_name}
                                  </span>
                                  {reg.team_tag && (
                                    <span className="text-[10px] font-mono font-bold text-amber-gold bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.2 rounded">
                                      [{reg.team_tag}]
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 font-rajdhani">
                                  <span>Captain: <strong className="text-gray-200">{reg.captain_name || 'Leader'}</strong></span>
                                  <span>•</span>
                                  <span>UID: <strong className="text-amber-gold font-mono">{reg.captain_uid || 'N/A'}</strong></span>
                                  <span>•</span>
                                  <a
                                    href={`https://wa.me/91${String(reg.captain_phone).replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-400 hover:underline flex items-center gap-1 font-mono font-bold"
                                    title="Open WhatsApp Chat to send room pass"
                                  >
                                    💬 {reg.captain_phone}
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* Middle: Prominent UTR Number Display */}
                            <div className="bg-panther-950/90 border border-panther-700/80 p-3 rounded clip-hud-sm space-y-1 flex-1 max-w-md">
                              <div className="flex items-center justify-between text-[10px] font-rajdhani font-bold text-gray-400 uppercase">
                                <span className="flex items-center gap-1">
                                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                                  12-Digit UPI UTR / Ref Number
                                </span>
                                <span className="text-amber-gold font-orbitron font-bold">
                                  ₹{reg.amount || 50}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <code className="text-sm sm:text-base font-mono font-black text-cyan-300 tracking-widest truncate">
                                  {reg.utr || 'NO_UTR_PROVIDED'}
                                </code>

                                <button
                                  type="button"
                                  onClick={() => handleCopyUtr(reg.utr)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-panther-800 hover:bg-panther-700 text-gray-200 text-[11px] font-rajdhani font-bold transition-colors flex-shrink-0"
                                  title="Copy UTR to verify in GPay/PhonePe"
                                >
                                  <Copy className="w-3 h-3 text-cyan-400" />
                                  <span>{copiedUtr === reg.utr ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>

                              <p className="text-[10px] text-gray-500 font-sans truncate">
                                Submitted: {new Date(reg.created_at).toLocaleString()}
                              </p>
                            </div>

                            {/* Right: Status & Admin Approval Buttons */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 min-w-[170px]">
                              {/* Status badge */}
                              <div>
                                {isPending && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-orbitron font-bold uppercase text-yellow-300 bg-yellow-950/90 border border-yellow-500/60 px-2.5 py-1 rounded">
                                    <Clock className="w-3 h-3 text-yellow-400 animate-spin" />
                                    <span>Pending Review</span>
                                  </span>
                                )}
                                {isAccepted && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-orbitron font-bold uppercase text-emerald-300 bg-emerald-950/90 border border-emerald-500/60 px-2.5 py-1 rounded">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Accepted & Slotted</span>
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-orbitron font-bold uppercase text-red-300 bg-red-950/90 border border-red-500/60 px-2.5 py-1 rounded">
                                    <XCircle className="w-3 h-3 text-red-400" />
                                    <span>Rejected</span>
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                {!isAccepted && (
                                  <button
                                    type="button"
                                    disabled={processingRegId === reg.id}
                                    onClick={() => handleAccept(reg)}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-rajdhani font-bold text-xs uppercase transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-50"
                                    title="Verify UTR and officially accept this team into the tournament"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Accept Team</span>
                                  </button>
                                )}

                                {!isRejected && (
                                  <button
                                    type="button"
                                    disabled={processingRegId === reg.id}
                                    onClick={() => handleReject(reg)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-950/80 hover:bg-red-900 border border-red-600/60 text-red-300 font-rajdhani font-bold text-xs uppercase transition-all hover:scale-105 disabled:opacity-50"
                                    title="Reject fake/invalid UTR and free this slot"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                  {/* Revenue Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm text-center">
                      <span className="text-[10px] font-rajdhani text-gray-400 uppercase block">Total Expected</span>
                      <span className="text-2xl font-orbitron font-black text-amber-gold">₹{bookedSlots.length * (activeTournament.entry_fee || 50)}</span>
                      <span className="text-[10px] text-gray-500">{bookedSlots.length} slots × ₹{activeTournament.entry_fee || 50}</span>
                    </div>
                    <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm text-center">
                      <span className="text-[10px] font-rajdhani text-gray-400 uppercase block">Prize Pool Out</span>
                      <span className="text-2xl font-orbitron font-black text-red-400">₹{activeTournament.prize_pool || 400}</span>
                      <span className="text-[10px] text-gray-500">₹200 + ₹130 + ₹70</span>
                    </div>
                    <div className="bg-panther-900 border border-emerald-500/30 p-4 rounded clip-hud-sm text-center">
                      <span className="text-[10px] font-rajdhani text-gray-400 uppercase block">Net Earnings</span>
                      <span className="text-2xl font-orbitron font-black text-emerald-400">
                        ₹{Math.max(0, (bookedSlots.length * (activeTournament.entry_fee || 50)) - (activeTournament.prize_pool || 400))}
                      </span>
                      <span className="text-[10px] text-gray-500">After prize payout</span>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* SECTION F: AUDIT TRAIL */}
          {activeSection === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
                    System & Referee Action Audit Trail ({adminLogs.length} Events)
                  </h3>
                </div>
              </div>

              <div className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden divide-y divide-panther-800/80 font-mono text-xs max-h-[600px] overflow-y-auto">
                {adminLogs.map(log => (
                  <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-panther-850/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-panther-800 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.action}
                      </span>
                      <span className="text-gray-300 font-sans">{log.details}</span>
                    </div>
                    <span className="text-gray-500 text-[11px] self-end sm:self-auto">
                      {new Date(log.timestamp).toLocaleTimeString()} IST
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TEAM ROSTER INSPECTION MODAL */}
      {inspectingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-panther-950/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-panther-900 border border-panther-700 rounded clip-hud p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-panther-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-panther-800 text-flame-400 font-orbitron font-black text-sm px-2 py-0.5 rounded">
                  {inspectingTeam.tag}
                </span>
                <h3 className="font-orbitron font-bold text-base text-white">
                  {inspectingTeam.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingTeam(null)}
                className="text-gray-400 hover:text-white text-xs font-bold uppercase"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-panther-950 p-3 rounded text-xs space-y-1 border border-panther-800">
                <div className="flex justify-between text-gray-400">
                  <span>Captain:</span>
                  <span className="font-bold text-white">{inspectingTeam.captain_name}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Captain UID:</span>
                  <span className="font-mono text-amber-gold">{inspectingTeam.captain_uid}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>WhatsApp / Phone:</span>
                  <span className="font-mono text-emerald-400">{inspectingTeam.captain_phone}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-orbitron font-bold text-gray-300 uppercase block mb-2">
                  Complete Squad Roster
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inspectingTeam.players?.map((p, idx) => (
                    <div key={idx} className="bg-panther-950 p-2.5 rounded border border-panther-800 text-xs">
                      <span className="font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] font-mono text-amber-gold block">UID: {p.uid}</span>
                      <span className="text-[9px] text-gray-500 font-mono uppercase">{p.role || 'Player'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="secondary" onClick={() => setInspectingTeam(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ALLOT SLOT MODAL */}
      {allottingSlotNum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-panther-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-panther-900 border border-flame-500/50 rounded clip-hud p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-panther-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-flame-500/20 border border-flame-500/40 flex items-center justify-center text-flame-400 font-orbitron font-black text-sm">
                  #{String(allottingSlotNum).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-sm text-white uppercase">
                    Manual Slot Allotment
                  </h3>
                  <span className="text-[10px] font-rajdhani text-gray-400">
                    Assign Slot #{allottingSlotNum} directly to a squad
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAllottingSlotNum(null)}
                className="text-gray-400 hover:text-white text-xs font-bold uppercase"
              >
                ✕ Close
              </button>
            </div>

            {/* Allot Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-panther-950 p-1 rounded border border-panther-800 text-xs font-rajdhani font-bold">
              <button
                type="button"
                onClick={() => setAllotTab('new')}
                className={`py-1.5 rounded uppercase transition-colors ${
                  allotTab === 'new'
                    ? 'bg-flame-500 text-white shadow-flame-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Enter New Squad
              </button>
              <button
                type="button"
                onClick={() => setAllotTab('existing')}
                className={`py-1.5 rounded uppercase transition-colors ${
                  allotTab === 'existing'
                    ? 'bg-flame-500 text-white shadow-flame-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Select Existing Team ({teams.length})
              </button>
            </div>

            {allotTab === 'existing' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Choose Registered Squad
                  </label>
                  <select
                    value={manualTeamSelect}
                    onChange={(e) => setManualTeamSelect(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-flame-500 font-rajdhani font-semibold"
                  >
                    <option value="">-- Choose Squad --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        [{t.tag}] {t.name} (Capt: {t.captain_name || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setAllottingSlotNum(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={!manualTeamSelect}
                    onClick={() => {
                      if (!manualTeamSelect) return;
                      allotSlotManual(activeTournament.id, allottingSlotNum, manualTeamSelect, user?.in_game_name || 'Admin');
                      setAllottingSlotNum(null);
                      setManualTeamSelect('');
                    }}
                  >
                    Confirm Allotment
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newSquadData.name.trim()) return;
                  allotSlotManual(activeTournament.id, allottingSlotNum, {
                    name: newSquadData.name.trim(),
                    tag: newSquadData.tag.trim().toUpperCase() || newSquadData.name.trim().substring(0, 4).toUpperCase(),
                    captain_name: newSquadData.captain_name.trim() || 'Captain',
                    captain_uid: newSquadData.captain_uid.trim(),
                    captain_phone: newSquadData.captain_phone.trim(),
                    players: [
                      { name: newSquadData.captain_name.trim() || 'Captain', uid: newSquadData.captain_uid.trim(), role: 'Captain / IGL' },
                      { name: 'Squad Member 2', uid: '999000111', role: 'Rusher' },
                      { name: 'Squad Member 3', uid: '999000222', role: 'Sniper' },
                      { name: 'Squad Member 4', uid: '999000333', role: 'Support' }
                    ]
                  }, user?.in_game_name || 'Admin');

                  setAllottingSlotNum(null);
                  setNewSquadData({ name: '', tag: '', captain_name: '', captain_uid: '', captain_phone: '' });
                }}
                className="space-y-3 text-xs font-rajdhani"
              >
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Squad Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Tigers"
                      value={newSquadData.name}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-flame-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Tag</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="e.g. RTG"
                      value={newSquadData.tag}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, tag: e.target.value.toUpperCase() }))}
                      className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-flame-400 font-orbitron uppercase font-bold focus:outline-none focus:border-flame-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Captain IGN *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RTG Leader"
                      value={newSquadData.captain_name}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, captain_name: e.target.value }))}
                      className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-flame-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">Free Fire UID (9-12 digits)</label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. 192847192"
                      value={newSquadData.captain_uid}
                      onChange={(e) => setNewSquadData(prev => ({ ...prev, captain_uid: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                      className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-amber-gold font-mono font-bold focus:outline-none focus:border-flame-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">WhatsApp / Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={newSquadData.captain_phone}
                    onChange={(e) => setNewSquadData(prev => ({ ...prev, captain_phone: e.target.value }))}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-flame-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-panther-800">
                  <Button size="sm" variant="outline" type="button" onClick={() => setAllottingSlotNum(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="primary" type="submit">
                    ✓ Allot Slot #{allottingSlotNum}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. ANNOUNCE & HOST NEW EVENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-panther-900 border border-flame-500/60 rounded clip-hud p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-panther-800 pb-3">
              <div>
                <span className="text-[10px] font-orbitron font-bold text-flame-400 uppercase tracking-widest block mb-0.5">
                  Esports Operations Center
                </span>
                <h3 className="font-orbitron font-black text-lg text-white uppercase tracking-wide">
                  Host & Announce New Tournament
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold uppercase p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
                ⚡ 1-Click Tournament Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewEventData(prev => ({
                      ...prev,
                      name: 'Panthers Tri-Map Championship — 3 Matches',
                      mode: 'Squad (4v4)',
                      map: 'Bermuda, Purgatory & Kalahari',
                      entry_fee: 50,
                      prize_pool: 400,
                      total_slots: 12,
                    }));
                  }}
                  className="p-2 rounded bg-panther-950 hover:bg-panther-800 border border-panther-800 text-[11px] font-rajdhani font-bold text-left text-gray-300 hover:text-white transition-colors"
                >
                  <span className="text-flame-400 block font-mono text-[9px]">3 MAPS</span>
                  Tri-Map Cup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewEventData(prev => ({
                      ...prev,
                      name: 'Panthers Weekend Booyah Clash',
                      mode: 'Squad (4v4)',
                      map: 'Bermuda',
                      entry_fee: 100,
                      prize_pool: 1000,
                      total_slots: 12,
                    }));
                  }}
                  className="p-2 rounded bg-panther-950 hover:bg-panther-800 border border-panther-800 text-[11px] font-rajdhani font-bold text-left text-gray-300 hover:text-white transition-colors"
                >
                  <span className="text-amber-gold block font-mono text-[9px]">₹1,000 PRIZE</span>
                  Weekend Clash
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewEventData(prev => ({
                      ...prev,
                      name: 'Panthers Night Customs 4v4 Showdown',
                      mode: 'Clash Squad (4v4)',
                      map: 'Bermuda',
                      entry_fee: 40,
                      prize_pool: 300,
                      total_slots: 12,
                    }));
                  }}
                  className="p-2 rounded bg-panther-950 hover:bg-panther-800 border border-panther-800 text-[11px] font-rajdhani font-bold text-left text-gray-300 hover:text-white transition-colors"
                >
                  <span className="text-cyan-400 block font-mono text-[9px]">CLASH SQUAD</span>
                  Night CS 4v4
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewEventData(prev => ({
                      ...prev,
                      name: 'Panthers Daily Pro Customs Series',
                      mode: 'Squad (4v4)',
                      map: 'Purgatory',
                      entry_fee: 30,
                      prize_pool: 250,
                      total_slots: 12,
                    }));
                  }}
                  className="p-2 rounded bg-panther-950 hover:bg-panther-800 border border-panther-800 text-[11px] font-rajdhani font-bold text-left text-gray-300 hover:text-white transition-colors"
                >
                  <span className="text-emerald-400 block font-mono text-[9px]">DAILY RUSH</span>
                  Daily Pro Scrim
                </button>
              </div>
            </div>

            {/* Event Form */}
            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                  Tournament / Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panthers Free Fire Tri-Map Series Season 2"
                  value={newEventData.name}
                  onChange={(e) => setNewEventData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white font-rajdhani font-bold focus:outline-none focus:border-flame-500"
                />
              </div>

              {/* Mode, Map & Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Game Mode
                  </label>
                  <select
                    value={newEventData.mode}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-rajdhani font-semibold focus:outline-none focus:border-flame-500"
                  >
                    <option value="Squad (4v4)">Squad (4v4)</option>
                    <option value="Duo">Duo</option>
                    <option value="Solo">Solo</option>
                    <option value="Clash Squad (4v4)">Clash Squad (4v4)</option>
                    <option value="Squad / Duo">Squad / Duo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Battle Map
                  </label>
                  <select
                    value={newEventData.map}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, map: e.target.value }))}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-rajdhani font-semibold focus:outline-none focus:border-flame-500"
                  >
                    <option value="Bermuda, Purgatory & Kalahari">Bermuda, Purgatory & Kalahari (3-Map)</option>
                    <option value="Bermuda">Bermuda Only</option>
                    <option value="Purgatory">Purgatory Only</option>
                    <option value="Kalahari">Kalahari Only</option>
                    <option value="Alpine">Alpine</option>
                    <option value="NexTerra">NexTerra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Total Slots
                  </label>
                  <select
                    value={newEventData.total_slots}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, total_slots: parseInt(e.target.value, 10) }))}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-flame-500"
                  >
                    <option value="12">12 Slots (FF BR Standard)</option>
                    <option value="16">16 Slots</option>
                    <option value="24">24 Slots</option>
                    <option value="48">48 Slots</option>
                  </select>
                </div>
              </div>

              {/* Schedule Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Match Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventData.date}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-flame-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Start Time (IST) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newEventData.time}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-flame-500"
                  />
                </div>
              </div>

              {/* Entry Fee & Prize Pool */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-panther-950 p-3 rounded border border-panther-800">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Squad Entry Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newEventData.entry_fee}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, entry_fee: e.target.value }))}
                    className="w-full bg-panther-900 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-flame-500"
                  />
                  <span className="text-[10px] text-gray-500 block mt-0.5">Enter 0 for Free Tournament</span>
                </div>

                <div>
                  <label className="block text-xs font-rajdhani font-bold text-amber-gold uppercase mb-1">
                    Total Prize Pool (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newEventData.prize_pool}
                    onChange={(e) => setNewEventData(prev => ({ ...prev, prize_pool: e.target.value }))}
                    className="w-full bg-panther-900 border border-amber-500/50 rounded px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 mt-1">
                    <span>1st: ₹{Math.round((parseFloat(newEventData.prize_pool) || 0) * 0.5)}</span>
                    <span>•</span>
                    <span>2nd: ₹{Math.round((parseFloat(newEventData.prize_pool) || 0) * 0.3)}</span>
                    <span>•</span>
                    <span>3rd: ₹{Math.round((parseFloat(newEventData.prize_pool) || 0) * 0.2)}</span>
                  </div>
                </div>
              </div>

              {/* Banner Poster Presets */}
              <div>
                <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                  Banner Poster URL
                </label>
                <input
                  type="url"
                  value={newEventData.banner_url}
                  onChange={(e) => setNewEventData(prev => ({ ...prev, banner_url: e.target.value }))}
                  className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-flame-500 mb-1"
                />
                <div className="flex items-center gap-2 text-[10px] font-rajdhani font-semibold text-gray-400">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => setNewEventData(prev => ({ ...prev, banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80' }))}
                    className="text-flame-400 hover:underline"
                  >
                    Battle Royale Neon
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setNewEventData(prev => ({ ...prev, banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80' }))}
                    className="text-amber-gold hover:underline"
                  >
                    Championship Trophy
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setNewEventData(prev => ({ ...prev, banner_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80' }))}
                    className="text-cyan-400 hover:underline"
                  >
                    Cyber Arena
                  </button>
                </div>
              </div>

              {/* Description & Rules */}
              <div>
                <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                  Event Description
                </label>
                <input
                  type="text"
                  value={newEventData.description}
                  onChange={(e) => setNewEventData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white font-sans focus:outline-none focus:border-flame-500"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-panther-800">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit" icon={Sparkles}>
                  🚀 Publish & Announce Tournament
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
