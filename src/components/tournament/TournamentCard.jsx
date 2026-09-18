import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency } from '../../lib/scoring';
import { Calendar, Clock, MapPin, Users, Flame, Trophy, ArrowRight } from 'lucide-react';
import { useTournaments } from '../../context/TournamentContext';

export const TournamentCard = ({ tournament, onSelect }) => {
  const { getTournamentSlots } = useTournaments();
  const slots = getTournamentSlots(tournament.id);

  const bookedCount = slots.filter(s => s.status !== 'open').length;
  const totalSlots = tournament.total_slots || 12;
  const percentBooked = Math.round((bookedCount / totalSlots) * 100);
  const isFull = bookedCount >= totalSlots;

  return (
    <div className="group relative bg-panther-900 border border-panther-800 hover:border-flame-500/60 transition-all duration-300 shadow-card-dark clip-hud overflow-hidden flex flex-col justify-between">
      {/* Top ambient highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-panther-700 to-transparent group-hover:via-flame-500 transition-all duration-300" />

      <div>
        {/* Banner with Map & Mode badges */}
        <div className="relative h-44 w-full overflow-hidden bg-panther-950">
          <img
            src={tournament.banner_url}
            alt={tournament.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-panther-900 via-panther-900/40 to-transparent" />

          {/* Badges in Header */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge status={tournament.status} />
            <span className="bg-panther-950/80 backdrop-blur-md text-gray-200 border border-panther-700/80 text-xs font-rajdhani font-bold px-2.5 py-0.5 rounded clip-hud-sm uppercase">
              {tournament.mode}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="bg-panther-950/90 backdrop-blur-md text-amber-gold border border-amber-gold/40 text-xs font-rajdhani font-bold px-2.5 py-0.5 rounded clip-hud-sm flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {tournament.map}
            </span>
          </div>

          {/* Prize Pool Spotlight */}
          <div className="absolute bottom-2.5 left-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-gold/20 border border-amber-gold/50 flex items-center justify-center text-amber-gold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-rajdhani font-bold text-gray-400 tracking-wider block">
                Prize Pool
              </span>
              <span className="text-xl font-orbitron font-black text-gold-gradient tracking-tight">
                {tournament.prize_pool > 0 ? formatCurrency(tournament.prize_pool) : 'FREE ENTRY'}
              </span>
            </div>
          </div>
        </div>

        {/* Tournament Body */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-orbitron font-bold text-white group-hover:text-flame-400 transition-colors line-clamp-1">
              {tournament.name}
            </h3>
            <p className="text-xs text-gray-400 font-sans line-clamp-2 mt-1">
              {tournament.description}
            </p>
          </div>

          {/* Match Details: Date, Time, Fee, Mode */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-panther-850/60 p-2.5 rounded border border-panther-800">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-flame-400" />
              <span>{tournament.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-flame-400" />
              <span>{tournament.time} IST</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Flame className="w-3.5 h-3.5 text-amber-gold" />
              <span className="font-bold text-amber-gold">Entry: ₹{tournament.entry_fee} / slot</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>{totalSlots} Slots • 3 Matches</span>
            </div>
          </div>

          {/* 3 Maps Back-to-Back Rotation Pill */}
          <div className="bg-panther-950/80 border border-panther-750 p-2 rounded text-[11px] font-rajdhani flex items-center justify-between">
            <span className="font-bold text-gray-400 uppercase">3 Maps Series:</span>
            <div className="flex items-center gap-1 font-bold text-white">
              <span className="text-amber-gold">Bermuda</span>
              <span className="text-gray-500">➔</span>
              <span className="text-flame-400">Purgatory</span>
              <span className="text-gray-500">➔</span>
              <span className="text-cyan-400">Kalahari</span>
            </div>
          </div>

          {/* Prize Distribution Preview */}
          <div className="bg-panther-950 border border-amber-gold/30 px-2.5 py-1.5 rounded flex items-center justify-between text-[11px] font-rajdhani font-bold">
            <span className="text-amber-gold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Winner: ₹200
            </span>
            <span className="text-slate-300">2nd: ₹130</span>
            <span className="text-amber-600">3rd: ₹70</span>
          </div>

          {/* Esports Rules Badge */}
          <div className="text-[10px] font-rajdhani font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Esports Rules Only (Attributes OFF • Mobile Only)</span>
          </div>

          {/* Slot Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-rajdhani">
              <span className="font-semibold text-gray-400 uppercase tracking-wider">
                Slot Registration
              </span>
              <span className="font-bold text-white">
                <span className={isFull ? "text-red-400" : "text-flame-400"}>{bookedCount}</span>
                <span className="text-gray-500"> / {totalSlots}</span>
                {isFull && <span className="ml-1.5 text-[10px] text-red-400 font-extrabold uppercase">[FULL]</span>}
              </span>
            </div>
            <div className="w-full h-2 bg-panther-800 rounded-full overflow-hidden border border-panther-700/50">
              <div 
                className={`h-full transition-all duration-500 ${
                  isFull 
                    ? 'bg-red-500' 
                    : percentBooked > 75 
                    ? 'bg-gradient-to-r from-amber-500 to-flame-500' 
                    : 'bg-gradient-to-r from-flame-600 to-flame-400'
                }`}
                style={{ width: `${percentBooked}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Button */}
      <div className="p-5 pt-0">
        <Button
          onClick={() => onSelect(tournament)}
          variant={tournament.status === 'live' ? 'danger' : isFull ? 'secondary' : 'primary'}
          className="w-full justify-center"
        >
          <span>{tournament.status === 'live' ? 'View Live Match & Standings' : isFull ? 'View Booked Slots' : 'Select Slot & Register'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
