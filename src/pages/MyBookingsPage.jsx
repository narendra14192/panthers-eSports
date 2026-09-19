import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTournaments } from '../context/TournamentContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Calendar, Clock, MapPin, Key, Shield, User, Download, Swords, ExternalLink } from 'lucide-react';

export const MyBookingsPage = ({ onNavigate, onSelectTournament }) => {
  const { user } = useAuth();
  const { tournaments, slots, teams, registrations, getTeamById } = useTournaments();

  // Comprehensive detection of all slots booked by user
  const cleanDigits = p => String(p || '').replace(/\D/g, '').slice(-10);
  const userPhone = cleanDigits(user?.phone);
  const userUid = String(user?.free_fire_uid || '').trim();
  const userTeam = String(user?.team_name || '').trim().toLowerCase();

  const mySlots = slots.filter(s => {
    if (s.status === 'open' || !s.team_id) return false;
    if (user?.team_id && s.team_id === user.team_id) return true;

    const team = (teams || []).find(t => t.id === s.team_id) || (getTeamById && getTeamById(s.team_id));
    if (team) {
      if (user?.id && team.captain_user_id === user.id) return true;
      if (userUid && team.captain_uid && team.captain_uid.trim() === userUid) return true;
      if (userPhone && team.captain_phone && cleanDigits(team.captain_phone) === userPhone) return true;
      if (userTeam && team.name && team.name.trim().toLowerCase() === userTeam) return true;
    }

    const reg = (registrations || []).find(
      r => (r.tournament_id === s.tournament_id || !r.tournament_id) && Number(r.slot_number) === Number(s.slot_number)
    );
    if (reg) {
      if (user?.id && reg.captain_user_id === user.id) return true;
      if (userUid && reg.captain_uid && reg.captain_uid.trim() === userUid) return true;
      if (userPhone && reg.captain_phone && cleanDigits(reg.captain_phone) === userPhone) return true;
      if (userTeam && reg.team_name && reg.team_name.trim().toLowerCase() === userTeam) return true;
    }

    try {
      const stored = sessionStorage.getItem(`panthers_confirmed_slot_${s.tournament_id}`);
      if (stored && Number(stored) === Number(s.slot_number)) return true;
    } catch {}

    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panther-800 pb-6">
        <div>
          <span className="text-xs font-rajdhani font-bold text-flame-400 uppercase tracking-widest block mb-1">
            Player Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-tight">
            My Registered Tournaments
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-panther-900 border border-panther-800 px-4 py-2 rounded clip-hud-sm flex items-center gap-2.5">
            <User className="w-4 h-4 text-flame-400" />
            <div className="text-xs">
              <span className="text-gray-400 block font-rajdhani">Logged in as</span>
              <span className="font-bold text-white">{user?.in_game_name} ({user?.team_tag})</span>
            </div>
          </div>
        </div>
      </div>

      {mySlots.length === 0 ? (
        <div className="bg-panther-900 border border-panther-800 rounded clip-hud p-12 text-center space-y-4 max-w-xl mx-auto">
          <Swords className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="font-orbitron font-bold text-xl text-white">
            No Tournaments Booked Yet
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
            You haven't reserved a slot in any active Free Fire tournaments yet. Browse upcoming tournaments and secure your slot today!
          </p>
          <Button
            variant="primary"
            onClick={() => onNavigate('tournaments')}
            icon={Swords}
          >
            Explore Open Tournaments
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {mySlots.map(slot => {
            const tournament = tournaments.find(t => t.id === slot.tournament_id);
            const team = (teams || []).find(t => t.id === slot.team_id) || (getTeamById && getTeamById(slot.team_id));
            if (!tournament) return null;

            return (
              <div
                key={slot.id}
                className="bg-panther-900 border border-panther-800 hover:border-flame-500/50 transition-all rounded clip-hud overflow-hidden shadow-card-dark"
              >
                {/* Top Card Header */}
                <div className="p-4 sm:p-5 bg-panther-850/60 border-b border-panther-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-flame-500/20 border border-flame-500/50 flex items-center justify-center">
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
                      <span className="text-xs font-rajdhani font-bold text-gray-400 uppercase">
                        {tournament.mode} • {tournament.map} • {tournament.date} at {tournament.time} IST
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      status={slot.status}
                      text={slot.status === 'checked_in' ? 'VERIFIED CHECKED IN' : 'SLOT BOOKED'}
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
                      View Match Page
                    </Button>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left: Custom Room Credentials Box */}
                  <div className="md:col-span-6 bg-panther-950/80 border border-panther-800 p-4 rounded clip-hud-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="w-4 h-4" /> Custom Room Credentials
                      </span>
                      {tournament.room_id ? (
                        <span className="text-[10px] text-emerald-400 font-bold font-rajdhani uppercase bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                          ACTIVE ROOM
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-mono">
                          Releasing 15m prior
                        </span>
                      )}
                    </div>

                    {tournament.room_id ? (
                      <div className="grid grid-cols-2 gap-3 bg-panther-900 p-3 rounded border border-cyan-500/30">
                        <div>
                          <span className="text-[10px] uppercase font-rajdhani text-gray-400 block font-bold">
                            In-Game Room ID
                          </span>
                          <span className="text-lg font-mono font-black text-cyan-300 select-all">
                            {tournament.room_id}
                          </span>
                        </div>
                        <div className="border-l border-panther-800 pl-3">
                          <span className="text-[10px] uppercase font-rajdhani text-gray-400 block font-bold">
                            Room Password
                          </span>
                          <span className="text-lg font-mono font-black text-amber-gold select-all">
                            {tournament.room_password || 'NONE'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-panther-900/60 p-4 rounded text-center text-xs text-gray-400 font-sans">
                        Room credentials have not been released by the admin yet. Please check back 15 minutes before match start.
                      </div>
                    )}

                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-flame-400 flex-shrink-0" />
                      <span>Only players registered in this slot's roster will be allowed into the room.</span>
                    </div>
                  </div>

                  {/* Right: Squad Roster Preview */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-orbitron font-bold text-gray-300 uppercase tracking-wider">
                        Registered Squad Lineup ({team?.players?.length || 4} Players)
                      </span>
                      <span className="text-xs font-rajdhani font-bold text-amber-gold uppercase">
                        [{team?.tag}] {team?.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {team?.players?.map((p, idx) => (
                        <div key={idx} className="bg-panther-950 p-2.5 rounded border border-panther-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-rajdhani font-bold text-gray-200 block truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-gold block">
                              UID: {p.uid}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 uppercase">
                            {p.role || (idx === 0 ? 'Captain' : 'Player')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
