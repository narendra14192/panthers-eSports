import React, { useState } from 'react';
import { Trophy, Flame, Skull, ChevronUp, ChevronDown, Award, HelpCircle } from 'lucide-react';

export const LeaderboardTable = ({ entries = [], selectedFilter, onFilterChange, tournaments = [] }) => {
  const [sortField, setSortField] = useState('points');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showScoringGuide, setShowScoringGuide] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => {
    let aVal = a[sortField] || 0;
    let bVal = b[sortField] || 0;

    if (sortOrder === 'desc') {
      return bVal - aVal;
    }
    return aVal - bVal;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar: Tournament Filter & Scoring Guide Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-panther-900 border border-panther-800 p-3.5 rounded clip-hud-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-rajdhani font-bold text-gray-400 uppercase">
            Filter Standings:
          </label>
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-panther-950 border border-panther-700 text-white text-xs sm:text-sm font-rajdhani font-bold rounded px-3 py-1.5 focus:outline-none focus:border-flame-500"
          >
            <option value="global">🏆 Global Circuit (Season 1 All-Time)</option>
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.mode})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowScoringGuide(!showScoringGuide)}
          className="flex items-center justify-center gap-1.5 text-xs font-rajdhani font-bold uppercase text-flame-400 hover:text-flame-300 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showScoringGuide ? 'Hide Scoring Rules' : 'Free Fire Scoring System'}</span>
        </button>
      </div>

      {/* Scoring Guide Accordion */}
      {showScoringGuide && (
        <div className="bg-panther-900/90 border border-flame-500/30 p-4 rounded clip-hud-sm space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-panther-800 pb-2">
            <h4 className="font-orbitron text-xs font-bold text-flame-400 uppercase tracking-wider">
              Official Free Fire Esports Scoring Formula
            </h4>
            <span className="text-[11px] text-gray-400 font-mono">1 Kill = 1 Point</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-panther-950 p-2 rounded border border-amber-gold/30">
              <span className="block font-bold text-amber-gold">1st (Booyah)</span>
              <span className="font-orbitron font-black text-sm text-white">12 pts</span>
            </div>
            <div className="bg-panther-950 p-2 rounded border border-slate-600">
              <span className="block font-bold text-gray-400">2nd Place</span>
              <span className="font-orbitron font-bold text-sm text-white">9 pts</span>
            </div>
            <div className="bg-panther-950 p-2 rounded border border-amber-900">
              <span className="block font-bold text-amber-600">3rd Place</span>
              <span className="font-orbitron font-bold text-sm text-white">8 pts</span>
            </div>
            <div className="bg-panther-950 p-2 rounded border border-panther-800">
              <span className="block font-bold text-gray-500">4th Place</span>
              <span className="font-orbitron font-bold text-sm text-gray-300">7 pts</span>
            </div>
            <div className="bg-panther-950 p-2 rounded border border-panther-800">
              <span className="block font-bold text-gray-500">5th Place</span>
              <span className="font-orbitron font-bold text-sm text-gray-300">6 pts</span>
            </div>
            <div className="bg-panther-950 p-2 rounded border border-panther-800">
              <span className="block font-bold text-gray-500">6th - 10th</span>
              <span className="font-orbitron font-bold text-sm text-gray-300">5 - 1 pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Data Table */}
      <div className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden shadow-card-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-panther-850 border-b border-panther-800 text-[11px] font-orbitron font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Squad / Clan</th>
                <th 
                  onClick={() => handleSort('points')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-flame-400">Total Points</span>
                    {sortField === 'points' && (sortOrder === 'desc' ? <ChevronDown className="w-3.5 h-3.5 text-flame-400" /> : <ChevronUp className="w-3.5 h-3.5 text-flame-400" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('kills')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Kills</span>
                    {sortField === 'kills' && (sortOrder === 'desc' ? <ChevronDown className="w-3.5 h-3.5 text-flame-400" /> : <ChevronUp className="w-3.5 h-3.5 text-flame-400" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('wins')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Booyahs</span>
                    {sortField === 'wins' && (sortOrder === 'desc' ? <ChevronDown className="w-3.5 h-3.5 text-flame-400" /> : <ChevronUp className="w-3.5 h-3.5 text-flame-400" />)}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('matches_played')}
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Matches</span>
                    {sortField === 'matches_played' && (sortOrder === 'desc' ? <ChevronDown className="w-3.5 h-3.5 text-flame-400" /> : <ChevronUp className="w-3.5 h-3.5 text-flame-400" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panther-800 text-sm font-rajdhani font-semibold">
              {sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 font-sans text-xs">
                    No match results recorded yet for this tournament. Matches will appear once admin records scores.
                  </td>
                </tr>
              ) : (
                sortedEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <tr
                      key={entry.id || idx}
                      className={`transition-colors hover:bg-panther-850/80 ${
                        isTop1
                          ? 'bg-amber-950/20 text-white font-bold'
                          : isTop2
                          ? 'bg-slate-900/40 text-gray-200'
                          : isTop3
                          ? 'bg-amber-950/10 text-gray-200'
                          : 'text-gray-300'
                      }`}
                    >
                      {/* Rank Indicator */}
                      <td className="py-4 px-4 text-center">
                        {isTop1 ? (
                          <span className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-gold to-yellow-600 text-panther-950 font-orbitron font-black text-xs inline-flex items-center justify-center shadow-gold-glow">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 font-orbitron font-bold text-xs inline-flex items-center justify-center border border-slate-500">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-950 text-amber-500 font-orbitron font-bold text-xs inline-flex items-center justify-center border border-amber-700">
                            3
                          </span>
                        ) : (
                          <span className="font-orbitron font-bold text-xs text-gray-500">
                            #{String(rank).padStart(2, '0')}
                          </span>
                        )}
                      </td>

                      {/* Squad Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-panther-800 text-flame-400 border border-panther-700 text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded">
                            {entry.team_tag}
                          </span>
                          <span className={`text-base font-bold ${isTop1 ? 'text-amber-gold' : 'text-white'}`}>
                            {entry.team_name}
                          </span>
                          {isTop1 && (
                            <span className="text-amber-gold" title="Current Leader">
                              <Trophy className="w-4 h-4 inline ml-1" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-4 text-center">
                        <span className={`font-orbitron font-black text-base ${isTop1 ? 'text-gold-gradient text-lg' : 'text-flame-400'}`}>
                          {entry.points}
                        </span>
                      </td>

                      {/* Kills */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-gray-300">
                          <Skull className="w-3.5 h-3.5 text-red-500/80" />
                          {entry.kills}
                        </span>
                      </td>

                      {/* Wins / Booyahs */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-orbitron font-bold text-amber-gold">
                          🏆 {entry.wins || 0}
                        </span>
                      </td>

                      {/* Matches Played */}
                      <td className="py-4 px-4 text-center font-mono text-gray-400 text-xs">
                        {entry.matches_played || 1}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
