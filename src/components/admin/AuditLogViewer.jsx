import React from 'react';
import { useTournaments } from '../../context/TournamentContext';
import { Shield, Clock, Terminal, User } from 'lucide-react';

export const AuditLogViewer = () => {
  const { adminLogs } = useTournaments();

  return (
    <div className="bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden shadow-card-dark">
      <div className="p-4 border-b border-panther-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
            System & Admin Action Audit Trail
          </h3>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          {adminLogs.length} Events Recorded
        </span>
      </div>

      <div className="divide-y divide-panther-850 max-h-96 overflow-y-auto font-mono text-xs">
        {adminLogs.length === 0 ? (
          <div className="p-6 text-center text-gray-500 font-sans">
            No audit events recorded yet.
          </div>
        ) : (
          adminLogs.map((log) => {
            const isDeleteOrRevoke = log.action.includes('REVOKED') || log.action.includes('DELETED');
            const isCreate = log.action.includes('CREATED');
            const isScore = log.action.includes('MATCH');

            return (
              <div key={log.id} className="p-3.5 hover:bg-panther-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isDeleteOrRevoke
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : isCreate
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : isScore
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-panther-800 text-cyan-400 border border-panther-700'
                  }`}>
                    {log.action}
                  </span>

                  <span className="text-gray-300 font-sans text-xs">
                    {log.details}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-gray-500 text-[11px] self-end sm:self-auto flex-shrink-0">
                  <span className="flex items-center gap-1 text-gray-400">
                    <User className="w-3 h-3 text-flame-400" />
                    {log.admin_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
