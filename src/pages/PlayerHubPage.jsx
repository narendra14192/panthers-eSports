import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTournaments } from '../context/TournamentContext';
import { PRESET_TEAM_LOGOS } from '../lib/teamLogos';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  User,
  Shield,
  Key,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Users,
  Flame,
  Download,
  ExternalLink,
  Edit2,
  Check,
  Phone,
  Hash,
  Swords,
  Upload
} from 'lucide-react';

export const PlayerHubPage = ({ onNavigate, onSelectTournament }) => {
  const { user, updateProfile, logout } = useAuth();
  const { tournaments, slots, teams, registrations = [] } = useTournaments();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'squad' | 'history'

  // Edit Profile / Team Name state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedIgn, setEditedIgn] = useState(user?.in_game_name || '');
  const [editedUid, setEditedUid] = useState(user?.free_fire_uid || '');
  const [editedTeamName, setEditedTeamName] = useState(user?.team_name || '');
  const [editedTeamTag, setEditedTeamTag] = useState(user?.team_tag || '');
  const [editedTeamImage, setEditedTeamImage] = useState(user?.team_image || user?.avatar || '');

  // Keep state in sync with authenticated user
  useEffect(() => {
    setEditedIgn(user?.in_game_name || '');
    setEditedUid(user?.free_fire_uid || '');
    setEditedTeamName(user?.team_name || '');
    setEditedTeamTag(user?.team_tag || '');
    setEditedTeamImage(user?.team_image || user?.avatar || '');
  }, [user]);

  // Handle image upload from computer in edit profile
  const handleEditLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedTeamImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Booked slots for this player's team
  const mySlots = slots.filter(s => s.team_id && s.team_id === user?.team_id);
  const myTeam = teams.find(t => t.id === user?.team_id) || {
    id: user?.team_id || 'team-1',
    name: user?.team_name || 'Panther Elites',
    tag: user?.team_tag || 'PNTR',
    players: [
      { name: user?.in_game_name || 'PNTR Shadow', uid: user?.free_fire_uid || '182947192', role: 'Captain / Rusher' },
      { name: 'PNTR Venom', uid: '293847102', role: 'Sniper' },
      { name: 'PNTR Blaze', uid: '482910394', role: 'Flanker' },
      { name: 'PNTR Ghost', uid: '958271039', role: 'Support' }
    ]
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      in_game_name: editedIgn,
      free_fire_uid: editedUid,
      team_name: editedTeamName,
      team_tag: editedTeamTag,
      team_image: editedTeamImage
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* 1. PLAYER HERO PROFILE CARD */}
      <div className="bg-gradient-to-r from-panther-900 via-panther-850 to-panther-900 border border-panther-800 rounded clip-hud p-6 shadow-card-dark flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* Squad / Team Emblem Display with Zero Broken Image Glyphs */}
          <div className="w-16 h-16 rounded-lg bg-panther-950 border-2 border-flame-500/60 p-1 flex items-center justify-center text-flame-400 font-orbitron font-black text-2xl overflow-hidden shadow-flame-sm relative flex-shrink-0">
            {user?.team_image || user?.avatar ? (
              <img
                src={user.team_image || user.avatar}
                alt={user?.team_name || 'Squad Emblem'}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className="w-full h-full object-contain"
              />
            ) : null}
            {(!user?.team_image && !user?.avatar) && (
              <div className="flex flex-col items-center justify-center">
                <Shield className="w-7 h-7 text-flame-400" />
                <span className="text-[10px] font-orbitron font-bold text-amber-gold uppercase">
                  {user?.team_tag || 'PNTR'}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-panther-800 text-flame-400 font-orbitron font-bold text-xs px-2 py-0.5 rounded">
                {user?.team_tag || 'TAG'}
              </span>
              <h1 className="text-2xl font-orbitron font-black text-white">
                {user?.in_game_name || 'Player'}
              </h1>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-600/50 text-[10px] font-orbitron font-bold px-2 py-0.5 rounded uppercase">
                VERIFIED ATHLETE
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-rajdhani text-gray-400 mt-1">
              <span className="flex items-center gap-1 font-mono text-amber-gold font-bold">
                <Hash className="w-3.5 h-3.5 text-gray-500" /> UID: {user?.free_fire_uid || 'N/A'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-500" /> {user?.phone || 'No phone'}
              </span>
              <span>•</span>
              <span className="text-gray-300 font-bold">
                Clan: {user?.team_name || 'Free Fire Squad'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            icon={Edit2}
          >
            {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              logout();
              onNavigate('login');
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Edit Profile Form Popup */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="bg-panther-900 border border-flame-500/50 p-5 rounded clip-hud space-y-4 animate-in fade-in">
          <h3 className="font-orbitron font-bold text-sm text-white uppercase flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-flame-400" /> Edit In-Game Profile & Squad Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-rajdhani font-bold text-gray-400 uppercase mb-1">In-Game Name (IGN)</label>
              <input
                type="text"
                value={editedIgn}
                onChange={(e) => setEditedIgn(e.target.value)}
                className="w-full bg-panther-950 border border-panther-700 rounded p-2 text-white font-rajdhani font-bold focus:outline-none focus:border-flame-500"
              />
            </div>
            <div>
              <label className="block font-rajdhani font-bold text-gray-400 uppercase mb-1">Free Fire UID</label>
              <input
                type="text"
                value={editedUid}
                onChange={(e) => setEditedUid(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-panther-950 border border-panther-700 rounded p-2 text-amber-gold font-mono font-bold focus:outline-none focus:border-flame-500"
              />
            </div>
            <div>
              <label className="block font-rajdhani font-bold text-gray-400 uppercase mb-1">Squad Name</label>
              <input
                type="text"
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
                className="w-full bg-panther-950 border border-panther-700 rounded p-2 text-white font-rajdhani font-bold focus:outline-none focus:border-flame-500"
              />
            </div>
            <div>
              <label className="block font-rajdhani font-bold text-gray-400 uppercase mb-1">Clan Tag</label>
              <input
                type="text"
                value={editedTeamTag}
                onChange={(e) => setEditedTeamTag(e.target.value.toUpperCase())}
                className="w-full bg-panther-950 border border-panther-700 rounded p-2 text-white font-orbitron uppercase focus:outline-none focus:border-flame-500"
              />
            </div>
          </div>

          {/* Squad Emblem in Edit Profile */}
          <div className="bg-panther-950/80 border border-panther-800 p-3 rounded clip-hud-sm space-y-2">
            <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase">
              Squad Logo / Emblem
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-panther-900 border border-flame-500/50 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                {editedTeamImage ? (
                  <img
                    src={editedTeamImage}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <Shield className="w-6 h-6 text-flame-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded bg-flame-500/20 hover:bg-flame-500/30 text-flame-400 border border-flame-500/40 text-xs font-rajdhani font-bold uppercase transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {editedTeamImage && (
                    <button
                      type="button"
                      onClick={() => setEditedTeamImage('')}
                      className="text-xs text-gray-400 hover:text-red-400 font-rajdhani font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-500 font-mono">Presets:</span>
                  {PRESET_TEAM_LOGOS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setEditedTeamImage(preset.svg)}
                      title={preset.name}
                      className={`w-6 h-6 rounded border p-0.5 transition-transform hover:scale-110 ${
                        editedTeamImage === preset.svg ? 'border-flame-500 bg-flame-500/30 ring-1 ring-flame-400' : 'border-panther-700 bg-panther-900'
                      }`}
                    >
                      <img src={preset.svg} alt={preset.name} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="primary" icon={Check}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {/* 2. CUSTOMER NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-panther-800 pb-2 text-sm font-rajdhani font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded clip-hud-sm transition-all ${
            activeTab === 'bookings'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          My Tournament Passes ({mySlots.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('squad')}
          className={`px-5 py-2.5 rounded clip-hud-sm transition-all ${
            activeTab === 'squad'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Squad Roster Details ({myTeam?.players?.length || 4} Players)
        </button>
      </div>

      {/* TAB A: MY TOURNAMENT PASSES & ROOM PASSWORDS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {mySlots.length === 0 ? (
            <div className="bg-panther-900 border border-panther-800 rounded clip-hud p-10 text-center space-y-4 max-w-md mx-auto">
              <Swords className="w-12 h-12 text-gray-600 mx-auto" />
              <h3 className="font-orbitron font-bold text-lg text-white">No Registered Tournaments</h3>
              <p className="text-xs text-gray-400 font-sans">
                You have not booked a slot in any active Free Fire events yet.
              </p>
              <Button variant="primary" onClick={() => onNavigate('tournaments')} icon={Swords}>
                Browse 24-Slot Tri-Map Event
              </Button>
            </div>
          ) : (
            mySlots.map(slot => {
              const tournament = tournaments.find(t => t.id === slot.tournament_id);
              if (!tournament) return null;

              return (
                <div key={slot.id} className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden shadow-card-dark">
                  {/* Pass Header */}
                  <div className="p-4 sm:p-5 bg-panther-850/70 border-b border-panther-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-flame-500/20 border border-flame-500/60 flex items-center justify-center">
                        <span className="font-orbitron font-black text-xl text-flame-400">
                          #{String(slot.slot_number).padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                            {tournament.name}
                          </h3>
                          <Badge status={tournament.status} size="sm" />
                        </div>
                        <span className="text-xs font-rajdhani font-bold text-amber-gold uppercase">
                          Bermuda ➔ Purgatory ➔ Kalahari (3 Matches Back-to-Back)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        status={slot.status}
                        text={slot.status === 'checked_in' ? 'VERIFIED CHECKED IN' : 'SLOT CONFIRMED'}
                        size="md"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelectTournament(tournament);
                          onNavigate('tournament-detail');
                        }}
                        icon={ExternalLink}
                      >
                        Match Page
                      </Button>
                    </div>
                  </div>

                  {/* UTR & Admin Approval Status Banner */}
                  {(() => {
                    const reg = (registrations || []).find(r => 
                      (r.slot_number === slot.slot_number && r.tournament_id === slot.tournament_id) ||
                      (r.team_id && r.team_id === user?.team_id) ||
                      (r.captain_user_id === user?.id)
                    ) || {
                      utr: myTeam?.payment?.utr || 'SUBMITTED',
                      status: slot.payment_status === 'verified' || slot.status === 'checked_in' ? 'accepted' : 'pending'
                    };

                    const isPending = reg.status === 'pending' || reg.status === 'pending_verification';
                    const isAccepted = reg.status === 'accepted' || reg.status === 'verified';
                    const isRejected = reg.status === 'rejected';

                    return (
                      <div className={`px-5 py-3 border-b border-panther-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isAccepted 
                          ? 'bg-emerald-950/20' 
                          : isRejected 
                          ? 'bg-red-950/20' 
                          : 'bg-yellow-950/20'
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <span className="font-rajdhani font-bold text-gray-400 uppercase">
                            Submitted UTR Number:
                          </span>
                          <code className="font-mono font-black text-cyan-300 bg-panther-950 px-2 py-0.5 rounded border border-cyan-500/30 text-xs tracking-wider">
                            {reg.utr || 'AWAITING_UTR'}
                          </code>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-rajdhani">Admin Approval:</span>
                          {isPending && (
                            <span className="inline-flex items-center gap-1 font-orbitron font-bold text-[10px] uppercase text-yellow-400 bg-yellow-900/40 border border-yellow-500/50 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3 text-yellow-400 animate-spin" />
                              <span>⏳ Under Staff Verification</span>
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 font-orbitron font-bold text-[10px] uppercase text-emerald-400 bg-emerald-900/40 border border-emerald-500/50 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>✅ Registration Approved & Slot Locked</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 font-orbitron font-bold text-[10px] uppercase text-red-400 bg-red-900/40 border border-red-500/50 px-2 py-0.5 rounded">
                              <span>❌ Registration Rejected</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Room Credentials Box */}
                  <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 bg-panther-950 p-4 rounded clip-hud-sm border border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                          <Key className="w-4 h-4" /> Custom In-Game Room Credentials
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                          ACTIVE ROOM
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-panther-900 p-3 rounded border border-cyan-500/20">
                        <div>
                          <span className="text-[10px] uppercase font-rajdhani text-gray-400 block font-bold">Room ID</span>
                          <span className="text-xl font-mono font-black text-cyan-300 select-all">{tournament.room_id || 'PENDING'}</span>
                        </div>
                        <div className="border-l border-panther-800 pl-3">
                          <span className="text-[10px] uppercase font-rajdhani text-gray-400 block font-bold">Password</span>
                          <span className="text-xl font-mono font-black text-amber-gold select-all">{tournament.room_password || 'PENDING'}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400">
                        Join custom room 15 minutes before Match 1 start. Gun skin attributes are OFF.
                      </p>
                    </div>

                    {/* Schedule & Pass Actions */}
                    <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                      <div className="space-y-1 text-xs font-rajdhani">
                        <span className="text-gray-400 font-bold block uppercase">Match Drop Schedule</span>
                        <div className="space-y-1 font-mono text-gray-300">
                          <div>• Match 1 (Bermuda): 19:00 IST</div>
                          <div>• Match 2 (Purgatory): 19:45 IST</div>
                          <div>• Match 3 (Kalahari): 20:30 IST</div>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.print()}
                        icon={Download}
                        className="w-full justify-center"
                      >
                        Print Match Pass Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB B: SQUAD ROSTER DETAILS */}
      {activeTab === 'squad' && (
        <div className="bg-panther-900 border border-panther-800 p-6 rounded clip-hud space-y-6">
          <div className="flex items-center justify-between border-b border-panther-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-panther-800 text-flame-400 font-orbitron font-bold text-sm px-2 py-0.5 rounded">
                  {myTeam?.tag}
                </span>
                <h3 className="font-orbitron font-bold text-lg text-white">
                  {myTeam?.name} Lineup
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Registered squad team players for Panthers Esports tournament series.
              </p>
            </div>
            <span className="text-xs font-rajdhani font-bold text-emerald-400 uppercase bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded">
              Verified Roster
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {myTeam?.players?.map((player, idx) => (
              <div key={idx} className="bg-panther-950 p-4 rounded clip-hud-sm border border-panther-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-orbitron font-black text-flame-400">
                    PLAYER #{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 uppercase bg-panther-900 px-1.5 py-0.5 rounded">
                    {player.role || (idx === 0 ? 'Captain' : 'Member')}
                  </span>
                </div>
                <h4 className="font-rajdhani font-bold text-white text-base truncate">
                  {player.name}
                </h4>
                <div className="pt-2 border-t border-panther-900">
                  <span className="text-[10px] uppercase font-rajdhani text-gray-500 block">Free Fire UID</span>
                  <span className="text-xs font-mono font-bold text-amber-gold select-all">{player.uid}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
