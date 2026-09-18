import React, { useState, useEffect } from 'react';
import { useTournaments } from '../../context/TournamentContext';
import { FREE_FIRE_PLACEMENT_POINTS, calculateMatchScore } from '../../lib/scoring';
import { Button } from '../common/Button';
import { Trophy, Flame, Skull, CheckCircle, AlertCircle, Save, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const MatchResultEntry = ({ tournament }) => {
  const { getTournamentSlots, getTeamById, submitMatchResults } = useTournaments();

  const [roundNumber, setRoundNumber] = useState(1);
  const [teamResults, setTeamResults] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const slots = getTournamentSlots(tournament.id);
  const bookedSlots = slots.filter(s => s.status !== 'open' && s.team_id);

  // Initialize roster of teams for result entry
  useEffect(() => {
    const initialRows = bookedSlots.map((slot, index) => {
      const team = getTeamById(slot.team_id);
      return {
        slot_number: slot.slot_number,
        team_id: slot.team_id,
        team_name: team?.name || `Team Slot #${slot.slot_number}`,
        team_tag: team?.tag || 'TAG',
        placement: index + 1, // Default sequence
        kills: 0,
      };
    });
    setTeamResults(initialRows);
  }, [tournament.id]);

  const handleResultChange = (teamId, field, value) => {
    const numeric = Math.max(0, parseInt(value, 10) || 0);
    setTeamResults(prev =>
      prev.map(row => (row.team_id === teamId ? { ...row, [field]: numeric } : row))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (teamResults.length === 0) {
      setErrorMsg('No teams are registered in this tournament to enter results for.');
      return;
    }

    // Validate placements: Check for duplicate placements
    const placements = teamResults.map(r => r.placement);
    const uniquePlacements = new Set(placements);
    if (uniquePlacements.size !== placements.length) {
      setErrorMsg('Duplicate placements detected! Each team must have a unique placement rank (1 to 12).');
      return;
    }

    submitMatchResults(tournament.id, roundNumber, teamResults);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#FFB800', '#FF4D00', '#00F0FF']
      });
    } catch { /* ignore */ }

    setSuccessMsg(`Round ${roundNumber} results published! Standings & Leaderboards have been automatically recalculated.`);
    setRoundNumber(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-panther-900 border border-panther-800 p-5 rounded clip-hud-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-panther-800 pb-4">
          <div>
            <h3 className="font-orbitron font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-gold" />
              Free Fire Match Scoring Engine
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Enter official placement and kills per squad. Free Fire 12-point table is applied instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-rajdhani font-bold text-gray-300 uppercase">
              Match Round:
            </label>
            <select
              value={roundNumber}
              onChange={(e) => setRoundNumber(parseInt(e.target.value, 10))}
              className="bg-panther-950 border border-panther-700 text-amber-gold font-orbitron font-bold text-xs rounded px-3 py-1.5 focus:outline-none"
            >
              <option value={1}>Round 1</option>
              <option value={2}>Round 2</option>
              <option value={3}>Round 3</option>
              <option value={4}>Round 4</option>
              <option value={5}>Round 5 (Finals)</option>
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/60 p-3 rounded clip-hud-sm flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-3 rounded clip-hud-sm flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {bookedSlots.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs">
            No squads registered yet in this tournament. Book slots first or use demo squads to record match scores.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-rajdhani">
                <thead>
                  <tr className="bg-panther-850 border-b border-panther-800 text-[10px] font-orbitron font-bold text-gray-400 uppercase">
                    <th className="py-2.5 px-3">Slot & Squad</th>
                    <th className="py-2.5 px-3 text-center w-28">Placement Rank</th>
                    <th className="py-2.5 px-3 text-center w-24">Placement Pts</th>
                    <th className="py-2.5 px-3 text-center w-28">Kills</th>
                    <th className="py-2.5 px-3 text-center w-24">Kill Pts</th>
                    <th className="py-2.5 px-3 text-center w-28">Round Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-panther-800/60 font-semibold">
                  {teamResults.map((row) => {
                    const score = calculateMatchScore(row.placement, row.kills);
                    const isBooyah = score.isBooyah;

                    return (
                      <tr
                        key={row.team_id}
                        className={`transition-colors ${
                          isBooyah ? 'bg-amber-950/20' : 'hover:bg-panther-850/40'
                        }`}
                      >
                        {/* Squad info */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-500 text-[10px]">
                              #{String(row.slot_number).padStart(2, '0')}
                            </span>
                            <span className="bg-panther-800 text-flame-400 font-orbitron text-[9px] font-bold px-1.5 py-0.2 rounded">
                              {row.team_tag}
                            </span>
                            <span className="font-bold text-white text-sm">
                              {row.team_name}
                            </span>
                            {isBooyah && (
                              <span className="text-amber-gold font-orbitron font-black text-[10px] uppercase bg-amber-gold/20 border border-amber-gold/50 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                                👑 BOOYAH
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Placement Input */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min={1}
                            max={12}
                            required
                            value={row.placement}
                            onChange={(e) => handleResultChange(row.team_id, 'placement', e.target.value)}
                            className="w-16 bg-panther-950 border border-panther-700 rounded px-2 py-1 text-center font-orbitron font-bold text-white text-sm focus:outline-none focus:border-flame-500"
                          />
                        </td>

                        {/* Placement Pts */}
                        <td className="py-2.5 px-3 text-center font-mono text-gray-300">
                          +{score.placementPoints}
                        </td>

                        {/* Kills Input */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            required
                            value={row.kills}
                            onChange={(e) => handleResultChange(row.team_id, 'kills', e.target.value)}
                            className="w-16 bg-panther-950 border border-panther-700 rounded px-2 py-1 text-center font-mono text-amber-gold font-bold text-sm focus:outline-none focus:border-flame-500"
                          />
                        </td>

                        {/* Kill Pts */}
                        <td className="py-2.5 px-3 text-center font-mono text-gray-300">
                          +{score.killPoints}
                        </td>

                        {/* Total Calculated Points */}
                        <td className="py-2.5 px-3 text-center">
                          <span className={`font-orbitron font-black text-base ${
                            isBooyah ? 'text-amber-gold' : 'text-flame-400'
                          }`}>
                            {score.totalPoints} PTS
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-panther-800">
              <span className="text-xs text-gray-400">
                Formula: Placement Points (12/9/8/7/6/5/4/3/2/1) + (1 Pt per Kill)
              </span>
              <Button type="submit" variant="primary" icon={Save}>
                Publish Round {roundNumber} Scores & Update Standings
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
