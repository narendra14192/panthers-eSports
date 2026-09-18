import React, { useState } from 'react';
import { useTournaments } from '../context/TournamentContext';
import { Podium } from '../components/leaderboard/Podium';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { Trophy, Flame, Skull, Crown, Award } from 'lucide-react';

export const LeaderboardPage = () => {
  const { tournaments, getGlobalLeaderboard, getTournamentLeaderboard } = useTournaments();

  const [selectedFilter, setSelectedFilter] = useState('global'); // 'global' or tournamentId

  const activeLeaderboard = selectedFilter === 'global'
    ? getGlobalLeaderboard()
    : getTournamentLeaderboard(selectedFilter);

  const topThree = activeLeaderboard.slice(0, 3);
  const topKillerSquad = [...activeLeaderboard].sort((a, b) => b.kills - a.kills)[0];
  const booyahKingSquad = [...activeLeaderboard].sort((a, b) => b.wins - a.wins)[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-panther-900 border border-amber-gold/40 text-xs font-rajdhani font-bold text-amber-gold uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          <span>Official Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-orbitron font-black text-white uppercase tracking-tight">
          Panthers <span className="text-flame-gradient">Leaderboards</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-sans">
          Points earned via official Free Fire battle royale scoring: Placement points + 1 kill point per elimination.
        </p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <Podium topTeams={topThree} />
      )}

      {/* MVP Badges Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {topKillerSquad && (
          <div className="bg-panther-900 border border-red-500/40 p-4 rounded clip-hud-sm flex items-center justify-between shadow-lg shadow-red-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-red-950 border border-red-600/60 flex items-center justify-center text-red-400">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-orbitron font-bold text-red-400 uppercase tracking-wider block">
                  Deadliest Squad (Kills MVP)
                </span>
                <span className="text-base font-rajdhani font-black text-white">
                  {topKillerSquad.team_name}
                </span>
              </div>
            </div>
            <span className="text-xl font-orbitron font-black text-red-400">
              {topKillerSquad.kills} KILLS
            </span>
          </div>
        )}

        {booyahKingSquad && (
          <div className="bg-panther-900 border border-amber-gold/40 p-4 rounded clip-hud-sm flex items-center justify-between shadow-gold-glow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-950 border border-amber-gold/60 flex items-center justify-center text-amber-gold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-orbitron font-bold text-amber-gold uppercase tracking-wider block">
                  Booyah Masters
                </span>
                <span className="text-base font-rajdhani font-black text-white">
                  {booyahKingSquad.team_name}
                </span>
              </div>
            </div>
            <span className="text-xl font-orbitron font-black text-amber-gold">
              {booyahKingSquad.wins} BOOYAHS
            </span>
          </div>
        )}
      </div>

      {/* Main Sortable Table */}
      <LeaderboardTable
        entries={activeLeaderboard}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        tournaments={tournaments}
      />
    </div>
  );
};
