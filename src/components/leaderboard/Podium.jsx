import React from 'react';
import { Trophy, Flame, Skull, Crown } from 'lucide-react';

export const Podium = ({ topTeams = [] }) => {
  if (!topTeams || topTeams.length < 3) return null;

  const first = topTeams[0];
  const second = topTeams[1];
  const third = topTeams[2];

  return (
    <div className="relative py-8 px-4 max-w-4xl mx-auto">
      {/* Background glow behind 1st place */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-flame-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end">
        {/* 2nd Place (Silver) */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 text-center w-full max-w-[160px]">
            <span className="w-8 h-8 rounded-full bg-slate-700/80 border border-slate-400/60 text-slate-200 font-orbitron font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow-md">
              2
            </span>
            <span className="bg-panther-800 text-slate-300 text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded uppercase">
              {second?.team_tag || '2ND'}
            </span>
            <h4 className="text-xs sm:text-sm font-rajdhani font-extrabold text-white truncate mt-1">
              {second?.team_name}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] font-rajdhani font-bold text-gray-400">
              <span className="text-slate-300">{second?.points} pts</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><Skull className="w-3 h-3 text-red-400" />{second?.kills}</span>
            </div>
          </div>
          {/* Pedestal */}
          <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-900 to-slate-800/90 border-t-2 border-slate-400/80 rounded-t clip-hud-sm flex flex-col items-center justify-center shadow-lg">
            <span className="text-xl sm:text-2xl font-orbitron font-black text-slate-400/40">#02</span>
            <span className="text-[10px] font-rajdhani font-bold text-slate-400 uppercase tracking-widest">RUNNER UP</span>
          </div>
        </div>

        {/* 1st Place (Gold / Booyah Champion) */}
        <div className="flex flex-col items-center relative -top-4">
          <div className="relative mb-3 text-center w-full max-w-[180px]">
            <div className="relative inline-block">
              <Crown className="w-7 h-7 text-amber-gold mx-auto mb-1 animate-bounce" />
              <span className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-gold to-yellow-600 border-2 border-yellow-300 text-panther-950 font-orbitron font-black text-base flex items-center justify-center mx-auto shadow-gold-glow">
                1
              </span>
            </div>
            <div className="mt-1">
              <span className="bg-amber-gold/20 text-amber-gold border border-amber-gold/50 text-[10px] font-orbitron font-black px-2 py-0.5 rounded uppercase">
                {first?.team_tag || '1ST'}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-orbitron font-black text-gold-gradient truncate mt-1">
              {first?.team_name}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-1 text-xs font-rajdhani font-extrabold text-amber-300">
              <span className="text-amber-gold font-mono text-sm">{first?.points} PTS</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><Skull className="w-3.5 h-3.5 text-red-400" />{first?.kills} Kills</span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-orbitron font-black text-flame-400 uppercase bg-flame-950/80 border border-flame-500/40 px-2 py-0.5 rounded">
                🏆 {first?.wins || 0} BOOYAHS
              </span>
            </div>
          </div>
          {/* Pedestal */}
          <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-amber-950/80 to-amber-900/40 border-t-2 border-amber-gold rounded-t clip-hud-sm flex flex-col items-center justify-center shadow-gold-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-panther-grid opacity-30" />
            <Trophy className="w-8 h-8 text-amber-gold/50 mb-1" />
            <span className="text-2xl sm:text-3xl font-orbitron font-black text-amber-gold/60">#01</span>
            <span className="text-xs font-orbitron font-black text-amber-gold uppercase tracking-widest">CHAMPION</span>
          </div>
        </div>

        {/* 3rd Place (Bronze) */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 text-center w-full max-w-[160px]">
            <span className="w-8 h-8 rounded-full bg-amber-950 border border-amber-700/60 text-amber-500 font-orbitron font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow-md">
              3
            </span>
            <span className="bg-panther-800 text-amber-600 text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded uppercase">
              {third?.team_tag || '3RD'}
            </span>
            <h4 className="text-xs sm:text-sm font-rajdhani font-extrabold text-white truncate mt-1">
              {third?.team_name}
            </h4>
            <div className="flex items-center justify-center gap-2 mt-1 text-[11px] font-rajdhani font-bold text-gray-400">
              <span className="text-amber-500">{third?.points} pts</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><Skull className="w-3 h-3 text-red-400" />{third?.kills}</span>
            </div>
          </div>
          {/* Pedestal */}
          <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-amber-950 to-amber-900/50 border-t-2 border-amber-700/80 rounded-t clip-hud-sm flex flex-col items-center justify-center shadow-lg">
            <span className="text-xl sm:text-2xl font-orbitron font-black text-amber-700/40">#03</span>
            <span className="text-[10px] font-rajdhani font-bold text-amber-600 uppercase tracking-widest">3RD PLACE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
