import React from 'react';
import { useTournaments } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Shield, Lock, CheckCircle2, UserCheck, Flame, Plus } from 'lucide-react';

export const SlotGrid = ({ tournament, onSelectSlot, selectedSlotNumber }) => {
  const { getTournamentSlots, getTeamById } = useTournaments();
  const { user } = useAuth();

  const slots = getTournamentSlots(tournament.id);

  const totalSlots = tournament.total_slots || 12;
  const openSlotsCount = slots.filter(s => s.status === 'open').length;
  const bookedSlotsCount = slots.filter(s => s.status === 'booked').length;
  const checkedInCount = slots.filter(s => s.status === 'checked_in').length;

  return (
    <div className="space-y-6">
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
          <span>Click any open slot to reserve for your squad</span>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {slots.map((slot) => {
          const isSelected = selectedSlotNumber === slot.slot_number;
          const team = slot.team_id ? getTeamById(slot.team_id) : null;
          const isMySlot = user?.team_id && slot.team_id === user.team_id;
          const isOpen = slot.status === 'open';
          const isCheckedIn = slot.status === 'checked_in';

          return (
            <div
              key={slot.id}
              onClick={() => {
                if (isOpen && tournament.status !== 'completed') {
                  onSelectSlot(slot.slot_number);
                }
              }}
              className={`relative p-3.5 sm:p-4 rounded transition-all duration-200 flex flex-col justify-between min-h-[140px] clip-hud-sm ${
                isMySlot
                  ? 'bg-gradient-to-b from-amber-950/60 to-panther-900 border-2 border-amber-gold shadow-gold-glow cursor-pointer'
                  : isSelected
                  ? 'bg-flame-950/80 border-2 border-flame-400 shadow-flame-md scale-[1.02] cursor-pointer'
                  : isOpen
                  ? 'bg-panther-900/90 border border-emerald-500/40 hover:border-emerald-400 hover:bg-panther-850 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer group'
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
                    <span className="bg-amber-gold/20 text-amber-gold border border-amber-gold/40 text-[9px] font-orbitron font-black px-1.5 py-0.5 rounded uppercase">
                      YOU
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
                      <span className="bg-panther-800 text-flame-400 text-[10px] font-orbitron font-extrabold px-1.5 py-0.2 rounded">
                        {team?.tag || 'TAG'}
                      </span>
                    </div>
                    <p className="text-xs font-rajdhani font-bold text-gray-200 truncate mt-1">
                      {team?.name || 'Registered Squad'}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">
                      Cpt: {team?.captain_name?.split(' ')?.[0] || 'Player'}
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
