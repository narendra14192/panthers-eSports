import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTournaments } from '../context/TournamentContext';
import { AdminSlotManager } from '../components/admin/AdminSlotManager';
import { MatchResultEntry } from '../components/admin/MatchResultEntry';
import { TournamentForm } from '../components/admin/TournamentForm';
import { AuditLogViewer } from '../components/admin/AuditLogViewer';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Shield, Plus, Swords, Key, Trophy, Edit, Trash2, Terminal, AlertCircle, CheckCircle, Lock } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, isAdmin, loginAsAdmin, switchRole } = useAuth();
  const { tournaments, slots, teams, deleteTournament } = useTournaments();

  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedTourneyId, setSelectedTourneyId] = useState(tournaments[0]?.id || '');
  const [activeAdminTab, setActiveAdminTab] = useState('slots'); // 'slots' | 'results' | 'catalog' | 'logs'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tournamentToEdit, setTournamentToEdit] = useState(null);

  // If user is not admin, show Passcode Wall
  if (!isAdmin) {
    const handleAuthSubmit = (e) => {
      e.preventDefault();
      setAuthError('');
      const res = loginAsAdmin(passcode);
      if (!res.success) {
        setAuthError(res.error || 'Access Denied.');
      }
    };

    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-panther-900 border border-red-500/50 rounded clip-hud p-8 shadow-card-dark text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-red-950 border border-red-600 flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-950/50">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-2xl font-orbitron font-black text-white uppercase tracking-wider">
              Protected Admin Area
            </h2>
            <p className="text-xs text-gray-400 font-sans mt-1">
              Restricted to Panthers Esports Staff & Tournament Officials.
            </p>
          </div>

          {authError && (
            <div className="bg-red-950/80 border border-red-600/70 p-2.5 rounded text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                Admin Passkey
              </label>
              <input
                type="password"
                placeholder="Enter PANTHER2026"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <Button type="submit" variant="danger" className="w-full justify-center">
              Unlock Staff Console
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchRole('admin')}
                className="text-xs font-rajdhani font-bold text-flame-400 hover:underline uppercase"
              >
                Or 1-Click Switch to Admin Mode (Demo)
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Active tournament object
  const activeTournament = tournaments.find(t => t.id === selectedTourneyId) || tournaments[0];

  // Stats calculation
  const totalSlotsCount = slots.length;
  const bookedSlotsCount = slots.filter(s => s.status !== 'open').length;
  const liveCount = tournaments.filter(t => t.status === 'live').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-panther-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-950 text-red-400 border border-red-700 text-[10px] font-orbitron font-bold px-2 py-0.5 rounded uppercase">
              Staff Console
            </span>
            <span className="text-xs text-gray-500 font-mono">Logged in as {user?.in_game_name}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-tight">
            Tournament Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setTournamentToEdit(null);
              setIsCreateModalOpen(true);
            }}
            icon={Plus}
          >
            Host New Tournament
          </Button>
        </div>
      </div>

      {/* Admin Quick Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm">
          <span className="text-[11px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider block">
            Total Tournaments
          </span>
          <span className="text-2xl sm:text-3xl font-orbitron font-black text-white">
            {tournaments.length}
          </span>
        </div>

        <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm">
          <span className="text-[11px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider block">
            Live Matches Now
          </span>
          <span className="text-2xl sm:text-3xl font-orbitron font-black text-red-500">
            {liveCount}
          </span>
        </div>

        <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm">
          <span className="text-[11px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider block">
            Slots Reserved
          </span>
          <span className="text-2xl sm:text-3xl font-orbitron font-black text-flame-400">
            {bookedSlotsCount} <span className="text-xs font-normal text-gray-500">/ {totalSlotsCount}</span>
          </span>
        </div>

        <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm">
          <span className="text-[11px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider block">
            Clans & Squads
          </span>
          <span className="text-2xl sm:text-3xl font-orbitron font-black text-amber-gold">
            {teams.length}
          </span>
        </div>
      </div>

      {/* Tournament Selector Bar */}
      <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-rajdhani font-bold text-gray-400 uppercase">
            Active Management Target:
          </label>
          <select
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(e.target.value)}
            className="bg-panther-950 border border-panther-700 text-white text-xs sm:text-sm font-rajdhani font-bold rounded px-3 py-1.5 focus:outline-none focus:border-flame-500 max-w-xs sm:max-w-md"
          >
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.status.toUpperCase()} • {t.mode})
              </option>
            ))}
          </select>
        </div>

        {activeTournament && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTournamentToEdit(activeTournament);
                setIsCreateModalOpen(true);
              }}
              icon={Edit}
            >
              Edit Details
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                if (window.confirm(`Delete tournament "${activeTournament.name}" and all associated slots?`)) {
                  deleteTournament(activeTournament.id);
                  setSelectedTourneyId(tournaments[0]?.id || '');
                }
              }}
              icon={Trash2}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Admin Action Tabs */}
      <div className="flex items-center gap-2 border-b border-panther-800 pb-2 text-sm font-rajdhani font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveAdminTab('slots')}
          className={`px-4 py-2 rounded clip-hud-sm transition-all ${
            activeAdminTab === 'slots'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Slot Controller & Rooms
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('results')}
          className={`px-4 py-2 rounded clip-hud-sm transition-all ${
            activeAdminTab === 'results'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Score Results Engine
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('catalog')}
          className={`px-4 py-2 rounded clip-hud-sm transition-all ${
            activeAdminTab === 'catalog'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Tournament Directory
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('logs')}
          className={`px-4 py-2 rounded clip-hud-sm transition-all ${
            activeAdminTab === 'logs'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab 1: Slots Management */}
      {activeAdminTab === 'slots' && activeTournament && (
        <AdminSlotManager tournament={activeTournament} />
      )}

      {/* Tab 2: Match Results Scoring */}
      {activeAdminTab === 'results' && activeTournament && (
        <MatchResultEntry tournament={activeTournament} />
      )}

      {/* Tab 3: Catalog List */}
      {activeAdminTab === 'catalog' && (
        <div className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden shadow-card-dark">
          <div className="p-4 border-b border-panther-800">
            <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
              All Configured Tournaments ({tournaments.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-rajdhani">
              <thead>
                <tr className="bg-panther-850 border-b border-panther-800 text-[10px] font-orbitron font-bold text-gray-400 uppercase">
                  <th className="p-3">Tournament</th>
                  <th className="p-3">Mode & Map</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Prize</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panther-800 font-semibold">
                {tournaments.map(t => (
                  <tr key={t.id} className="hover:bg-panther-850/60 transition-colors">
                    <td className="p-3">
                      <span className="font-bold text-white text-sm block">{t.name}</span>
                      <span className="text-[10px] font-mono text-gray-500">ID: {t.id}</span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {t.mode} • {t.map}
                    </td>
                    <td className="p-3 text-gray-300">
                      {t.date} at {t.time} IST
                    </td>
                    <td className="p-3 font-mono text-amber-gold font-bold">
                      {t.prize_pool > 0 ? `₹${t.prize_pool}` : 'Free'}
                    </td>
                    <td className="p-3">
                      <Badge status={t.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedTourneyId(t.id);
                            setActiveAdminTab('slots');
                          }}
                        >
                          Manage Slots
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTournamentToEdit(t);
                            setIsCreateModalOpen(true);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeAdminTab === 'logs' && (
        <AuditLogViewer />
      )}

      {/* Create / Edit Modal */}
      <TournamentForm
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTournamentToEdit(null);
        }}
        tournamentToEdit={tournamentToEdit}
      />
    </div>
  );
};
