import React, { useState } from 'react';
import { useTournaments } from '../../context/TournamentContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Shield, Trash2, CheckCircle2, UserCheck, Key, Radio, AlertTriangle, Users, Sparkles } from 'lucide-react';

export const AdminSlotManager = ({ tournament }) => {
  const {
    getTournamentSlots,
    getTeamById,
    freeSlot,
    checkInSlot,
    allotSlotManual,
    updateTournamentRoom,
    updateTournamentStatus,
    teams
  } = useTournaments();

  const [roomId, setRoomId] = useState(tournament?.room_id || '');
  const [roomPassword, setRoomPassword] = useState(tournament?.room_password || '');
  const [savedRoomMsg, setSavedRoomMsg] = useState(false);

  // Manual allotting state
  const [allottingSlot, setAllottingSlot] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  if (!tournament) return null;

  const slots = getTournamentSlots(tournament.id);

  const handleSaveRoom = (e) => {
    e.preventDefault();
    updateTournamentRoom(tournament.id, roomId, roomPassword);
    setSavedRoomMsg(true);
    setTimeout(() => setSavedRoomMsg(false), 2500);
  };

  const handleAllotSubmit = (slotNumber) => {
    if (!selectedTeamId) return;
    allotSlotManual(tournament.id, slotNumber, selectedTeamId);
    setAllottingSlot(null);
    setSelectedTeamId('');
  };

  return (
    <div className="space-y-6">
      {/* Tournament Status & Room Management Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Controller */}
        <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-orbitron font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-flame-400" />
              Tournament Match Status
            </span>
            <Badge status={tournament.status} size="sm" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={tournament.status === 'upcoming' ? 'primary' : 'secondary'}
              onClick={() => updateTournamentStatus(tournament.id, 'upcoming')}
            >
              Upcoming
            </Button>
            <Button
              size="sm"
              variant={tournament.status === 'live' ? 'danger' : 'secondary'}
              onClick={() => updateTournamentStatus(tournament.id, 'live')}
            >
              Mark Live Match
            </Button>
            <Button
              size="sm"
              variant={tournament.status === 'completed' ? 'accent' : 'secondary'}
              onClick={() => updateTournamentStatus(tournament.id, 'completed')}
            >
              Mark Completed
            </Button>
          </div>
          <p className="text-[11px] text-gray-400">
            Setting status to <strong>LIVE</strong> highlights this tournament with red alert styling across the platform.
          </p>
        </div>

        {/* Room ID & Pass Quick Broadcast */}
        <form onSubmit={handleSaveRoom} className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              Publish In-Game Custom Room Credentials
            </span>
            {savedRoomMsg && (
              <span className="text-[11px] text-emerald-400 font-bold font-rajdhani animate-in fade-in">
                ✓ Broadcasted to Players!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                placeholder="Room ID (e.g. 7829104)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Room Pass (e.g. PANTHERS)"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="w-full bg-panther-950 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="cyan">
              Broadcast Room Credentials
            </Button>
          </div>
        </form>
      </div>

      {/* Slots Control Table */}
      <div className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden shadow-card-dark">
        <div className="p-4 border-b border-panther-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-flame-400" />
            <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
              Live Slot Allocation Table ({slots.length} Total Slots)
            </h3>
          </div>
          <span className="text-xs font-rajdhani text-gray-400">
            Admins have full authority to revoke, allot, and check-in teams
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-rajdhani">
            <thead>
              <tr className="bg-panther-850 border-b border-panther-800 font-orbitron font-bold text-gray-400 uppercase text-[10px]">
                <th className="py-3 px-3 w-16 text-center">Slot</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Squad Name</th>
                <th className="py-3 px-3">Captain & UID</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panther-800/70 font-semibold">
              {slots.map((slot) => {
                const team = slot.team_id ? getTeamById(slot.team_id) : null;
                const isOpen = slot.status === 'open';
                const isCheckedIn = slot.status === 'checked_in';

                return (
                  <tr key={slot.id} className="hover:bg-panther-850/60 transition-colors">
                    {/* Slot # */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-orbitron font-black text-sm text-white">
                        #{String(slot.slot_number).padStart(2, '0')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <Badge status={slot.status} size="sm" />
                    </td>

                    {/* Squad Details */}
                    <td className="py-3 px-3">
                      {team ? (
                        <div className="flex items-center gap-1.5">
                          <span className="bg-panther-800 text-flame-400 font-orbitron font-bold text-[9px] px-1.5 py-0.2 rounded">
                            {team.tag}
                          </span>
                          <span className="font-bold text-white text-sm">
                            {team.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Empty Slot</span>
                      )}
                    </td>

                    {/* Captain & UID */}
                    <td className="py-3 px-3 font-mono">
                      {team ? (
                        <div>
                          <span className="text-gray-200 block">{team.captain_name}</span>
                          <span className="text-amber-gold text-[10px]">UID: {team.captain_uid}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 font-mono text-gray-400">
                      {team?.captain_phone || '—'}
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isOpen ? (
                          allottingSlot === slot.slot_number ? (
                            <div className="flex items-center gap-1">
                              <select
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="bg-panther-950 border border-panther-700 text-white text-[11px] rounded px-1.5 py-1 focus:outline-none"
                              >
                                <option value="">Select Team...</option>
                                {teams.map(t => (
                                  <option key={t.id} value={t.id}>
                                    [{t.tag}] {t.name}
                                  </option>
                                ))}
                              </select>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAllotSubmit(slot.slot_number)}
                              >
                                Allot
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setAllottingSlot(null)}
                              >
                                X
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAllottingSlot(slot.slot_number)}
                            >
                              Assign Squad
                            </Button>
                          )
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => checkInSlot(tournament.id, slot.slot_number)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors border ${
                                isCheckedIn
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900'
                                  : 'bg-panther-800 text-gray-300 border-panther-700 hover:text-cyan-400 hover:border-cyan-500'
                              }`}
                              title={isCheckedIn ? 'Mark Unchecked' : 'Verify Check-in'}
                            >
                              {isCheckedIn ? 'Checked In ✓' : 'Check In'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to revoke and free Slot #${slot.slot_number}?`)) {
                                  freeSlot(tournament.id, slot.slot_number);
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-400 bg-panther-800/80 hover:bg-red-950 border border-transparent hover:border-red-600 rounded transition-colors"
                              title="Free / Kick Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
