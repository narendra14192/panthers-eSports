import React, { useState } from 'react';
import { useTournaments } from '../context/TournamentContext';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { Button } from '../components/common/Button';
import { Search, Filter, Swords, MapPin } from 'lucide-react';

export const TournamentsPage = ({ onSelectTournament, onNavigate }) => {
  const { tournaments } = useTournaments();

  const [modeFilter, setModeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mapFilter, setMapFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTournaments = tournaments.filter(t => {
    if (modeFilter !== 'ALL' && !t.mode.toUpperCase().includes(modeFilter)) return false;
    if (statusFilter !== 'ALL' && t.status.toUpperCase() !== statusFilter) return false;
    if (mapFilter !== 'ALL' && !t.map.toUpperCase().includes(mapFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchMap = t.map.toLowerCase().includes(q);
      if (!matchName && !matchMap) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-panther-800 pb-6">
        <div>
          <span className="text-xs font-rajdhani font-bold text-flame-400 uppercase tracking-widest block mb-1">
            Free Fire Competitive Arena
          </span>
          <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-tight">
            Tournaments Directory
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-400 font-sans max-w-md sm:text-right">
          Reserve your squad's slot with real-time locking. Check out official maps, prize pools, and schedules.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tournament or map..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panther-950 border border-panther-700/80 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-flame-500 font-rajdhani font-semibold"
            />
          </div>

          {/* Mode */}
          <div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full bg-panther-950 border border-panther-700/80 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-flame-500 font-rajdhani font-bold"
            >
              <option value="ALL">All Modes (Solo, Duo, Squad)</option>
              <option value="SQUAD">Squad (4v4)</option>
              <option value="DUO">Duo (2v2)</option>
              <option value="SOLO">Solo (1v1)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-panther-950 border border-panther-700/80 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-flame-500 font-rajdhani font-bold"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">Upcoming Only</option>
              <option value="LIVE">Live Matches Only</option>
              <option value="COMPLETED">Completed Only</option>
            </select>
          </div>

          {/* Map */}
          <div>
            <select
              value={mapFilter}
              onChange={(e) => setMapFilter(e.target.value)}
              className="w-full bg-panther-950 border border-panther-700/80 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-flame-500 font-rajdhani font-bold"
            >
              <option value="ALL">All Battle Maps</option>
              <option value="BERMUDA">Bermuda</option>
              <option value="PURGATORY">Purgatory</option>
              <option value="KALAHARI">Kalahari</option>
              <option value="NEXTERRA">NeXTerra</option>
              <option value="ALPINE">Alpine</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-panther-800 text-xs font-rajdhani font-bold">
          <span className="text-gray-400">Quick Filters:</span>
          {['ALL', 'SQUAD', 'DUO', 'SOLO'].map((m) => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-2.5 py-0.5 rounded uppercase tracking-wider transition-colors ${
                modeFilter === m
                  ? 'bg-flame-500 text-white shadow-flame-sm'
                  : 'bg-panther-950 text-gray-400 hover:text-white border border-panther-800'
              }`}
            >
              {m}
            </button>
          ))}
          <span className="text-panther-700">|</span>
          {['ALL', 'LIVE', 'UPCOMING'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-0.5 rounded uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? 'bg-amber-gold text-panther-950 font-extrabold shadow-gold-glow'
                  : 'bg-panther-950 text-gray-400 hover:text-white border border-panther-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {filteredTournaments.length === 0 ? (
        <div className="bg-panther-900 border border-panther-800 rounded clip-hud p-12 text-center space-y-3">
          <Swords className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="font-orbitron font-bold text-lg text-white">
            No Tournaments Found
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try adjusting your search criteria or filter tags to see more Free Fire matches.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setModeFilter('ALL');
              setStatusFilter('ALL');
              setMapFilter('ALL');
              setSearchQuery('');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map(t => (
            <TournamentCard
              key={t.id}
              tournament={t}
              onSelect={(tourney) => {
                onSelectTournament(tourney);
                onNavigate('tournament-detail');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
