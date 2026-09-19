import React from 'react';
import { useTournaments } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Shield, Lock, CheckCircle2, UserCheck, Flame, Plus, Check } from 'lucide-react';

export const SlotGrid = ({ tournament, onSelectSlot, selectedSlotNumber }) => {
  const { getTournamentSlots, getTeamById, teams, registrations } = useTournaments();
  const { user } = useAuth();

  const slots = getTournamentSlots(tournament.id);

  const totalSlots = tournament.total_slots || 12;
  const openSlotsCount = slots.filter(s => s.status === 'open').length;
  const bookedSlotsCount = slots.filter(s => s.status === 'booked' || s.status === 'pending_verification').length;
  const checkedInCount = slots.filter(s => s.status === 'checked_in').length;

  // Comprehensive player slot detection
  const cleanDigits = p => String(p || '').replace(/\D/g, '').slice(-10);
  const userPhone = cleanDigits(user?.phone);
  const userUid = String(user?.free_fire_uid || '').trim();
  const userTeam = String(user?.team_name || '').trim().toLowerCase();

  const mySlot = slots.find(s => {
    if (s.status === 'open' || !s.team_id) return false;
    if (user?.team_id && s.team_id === user.team_id) return true;

    const team = getTeamById(s.team_id);
    if (team) {
      if (user?.id && team.captain_user_id === user.id) return true;
      if (userUid && team.captain_uid && team.captain_uid.trim() === userUid) return true;
      if (userPhone && team.captain_phone && cleanDigits(team.captain_phone) === userPhone) return true;
      if (userTeam && team.name && team.name.trim().toLowerCase() === userTeam) return true;
    }

    const reg = (registrations || []).find(
      r => (r.tournament_id === tournament.id || !r.tournament_id) && Number(r.slot_number) === Number(s.slot_number)
    );
    if (reg) {
      if (user?.id && reg.captain_user_id === user.id) return true;
      if (userUid && reg.captain_uid && reg.captain_uid.trim() === userUid) return true;
      if (userPhone && reg.captain_phone && cleanDigits(reg.captain_phone) === userPhone) return true;
      if (userTeam && reg.team_name && reg.team_name.trim().toLowerCase() === userTeam) return true;
    }

    try {
      const stored = sessionStorage.getItem(`panthers_confirmed_slot_${tournament.id}`);
      if (stored && Number(stored) === Number(s.slot_number)) return true;
    } catch {}

    return false;
  });

  const myTeam = mySlot ? getTeamById(mySlot.team_id) : null;

  return (
    <div className="space-y-6">
      {/* 1 Slot Per Person Policy Banner if user already booked */}
      {mySlot && (
        <div className="bg-gradient-to-r from-amber-950/80 via-panther-900 to-amber-950/80 border-2 border-amber-gold p-4 rounded clip-hud flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-gold-glow animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-gold/20 border-2 border-amber-gold flex items-center justify-center text-amber-gold flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-orbitron font-black text-amber-gold uppercase tracking-wider">
                  Your Squad Slot #{String(mySlot.slot_number).padStart(2, '0')} is Secured!
                </span>
                <span className="bg-amber-gold text-panther-950 text-[9px] font-orbitron font-extrabold px-1.5 py-0.5 rounded uppercase">
                  Confirmed
                </span>
              </div>
              <p className="text-xs text-gray-300 font-rajdhani mt-0.5">
                Rule: <strong>1 Slot Per Person</strong> · Registered Team: <strong className="text-white">[{myTeam?.tag || 'PNTR'}] {myTeam?.name || user?.team_name || 'Your Team'}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-gold bg-panther-950 px-3 py-1.5 rounded border border-amber-gold/40">
              SLOT #{String(mySlot.slot_number).padStart(2, '0')} (LOCKED)
            </span>
          </div>
        </div>
      )}

      {/* Legend & Stats Banner */}
      <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm flex flex-wrap items-center justify-between gap-4">
        {/* Quick Counters */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-rajdhani font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-gray-300">OPEN:</span>
            <span className="text-emerald-400 font-mono text-base">{openSlotsCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-flame-500 shadow-[0_0_8px_rgba(255,77,0,0.5)]" />
            <span className="text-gray-300">BOOKED:</span>
            <span className="text-flame-400 font-mono text-base">{bookedSlotsCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
            <span className="text-gray-300">CHECKED IN:</span>
            <span className="text-cyan-400 font-mono text-base">{checkedInCount}</span>
          </div>
        </div>

        {/* Real-time Indicator notice */}
        <div className="flex items-center gap-2 text-xs font-rajdhani text-gray-400">
          <span className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
          <span>
            {mySlot
              ? `You have secured Slot #${String(mySlot.slot_number).padStart(2, '0')} (1 slot per player)`
              : user
              ? 'Click any open slot to reserve (1 slot per player)'
              : 'Sign in to reserve an open slot for your squad'}
          </span>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {slots.map((slot) => {
          const isSelected = selectedSlotNumber === slot.slot_number;
          const team = slot.team_id ? getTeamById(slot.team_id) : null;
          const isMySlot = mySlot && Number(mySlot.slot_number) === Number(slot.slot_number);
          const isOpen = slot.status === 'open';
          const isCheckedIn = slot.status === 'checked_in';

          return (
            <div
              key={slot.id}
              onClick={() => {
                if (isOpen && tournament.status !== 'completed') {
                  if (mySlot) {
                    alert(`Only 1 slot per player is allowed! You have already secured Slot #${String(mySlot.slot_number).padStart(2, '0')} for this tournament.`);
                    return;
                  }
                  onSelectSlot(slot.slot_number);
                }
              }}
              className={`relative p-3.5 sm:p-4 rounded transition-all duration-200 flex flex-col justify-between min-h-[140px] clip-hud-sm ${
                isMySlot
                  ? 'bg-gradient-to-b from-amber-950/70 to-panther-900 border-2 border-amber-gold shadow-gold-glow cursor-default'
                  : isSelected
                  ? 'bg-flame-950/80 border-2 border-flame-400 shadow-flame-md scale-[1.02] cursor-pointer'
                  : isOpen
                  ? mySlot
                    ? 'bg-panther-900/60 border border-emerald-500/20 opacity-70 cursor-not-allowed'
                    : 'bg-panther-900/90 border border-emerald-500/40 hover:border-emerald-400 hover:bg-panther-850 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer group'
                  : isCheckedIn
                  ? 'bg-panther-900 border border-cyan-500/40 opacity-90'
                  : 'bg-panther-950 border border-panther-800/80 opacity-80'
              }`}
            >
              {/* Slot Header: Number & Status Icon */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-rajdhani font-bold text-gray-400 uppercase tracking-widest block">
                    SLOT
                  </span>
                  <span className={`text-2xl sm:text-3xl font-orbitron font-black leading-none ${
                    isMySlot ? 'text-amber-gold' : isOpen ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-gray-300'
                  }`}>
                    #{String(slot.slot_number).padStart(2, '0')}
                  </span>
                </div>

                <div>
                  {isMySlot ? (
                    <span className="bg-amber-gold text-panther-950 border border-amber-gold text-[9px] font-orbitron font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm">
                      <Check className="w-2.5 h-2.5" /> YOU
                    </span>
                  ) : isCheckedIn ? (
                    <span className="text-cyan-400" title="Checked In">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  ) : !isOpen ? (
                    <span className="text-gray-500" title="Booked">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  )}
                </div>
              </div>

              {/* Slot Content: Team Tag or Open Callout */}
              <div className="my-2">
                {isOpen ? (
                  <div className="text-center py-2">
                    <span className="inline-flex items-center gap-1 text-xs font-rajdhani font-extrabold text-emerald-400 group-hover:text-emerald-300 uppercase tracking-wider">
                      <Plus className="w-3.5 h-3.5" /> Available
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-orbitron font-extrabold px-1.5 py-0.2 rounded ${
                        isMySlot ? 'bg-amber-gold/20 text-amber-gold' : 'bg-panther-800 text-flame-400'
                      }`}>
                        {team?.tag || (isMySlot ? (user?.team_tag || 'PNTR') : 'TAG')}
                      </span>
                    </div>
                    <p className="text-xs font-rajdhani font-bold text-gray-200 truncate mt-1">
                      {team?.name || (isMySlot ? (user?.team_name || 'Your Squad') : 'Registered Squad')}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">
                      Cpt: {team?.captain_name?.split(' ')?.[0] || (isMySlot ? (user?.in_game_name || 'You') : 'Player')}
                    </p>
                  </div>
                )}
              </div>

              {/* Slot Footer Badge */}
              <div className="mt-auto pt-2 border-t border-panther-800/60 flex items-center justify-between">
                <Badge
                  status={isMySlot ? 'checked_in' : slot.status}
                  text={isMySlot ? 'YOUR SQUAD' : undefined}
                  size="sm"
                  className="w-full justify-center text-[9px]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

