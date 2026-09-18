import React from 'react';
import { Shield, Flame, Trophy, Instagram, MessageSquare, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-panther-950 border-t border-panther-800/80 pt-12 pb-8 mt-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-flame-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/panther-logo.svg" alt="Panthers Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,77,0,0.4)]" />
              <div className="flex items-center gap-1.5">
                <span className="font-orbitron font-black text-xl tracking-wider text-white">PANTHERS</span>
                <span className="font-orbitron font-black text-xl tracking-wider text-flame-500">ESPORTS</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              The premier competitive Battle Royale hub for Free Fire athletes. Automated slot allocations, fast match room distribution, and verifiable Booyah leaderboards.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded bg-panther-850 border border-panther-700/80 flex items-center justify-center text-gray-400 hover:text-flame-400 hover:border-flame-500/50 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded bg-panther-850 border border-panther-700/80 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded bg-panther-850 border border-panther-700/80 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-orbitron text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-flame-500 inline-block" />
              Quick Access
            </h4>
            <ul className="space-y-2.5 text-sm font-rajdhani font-semibold text-gray-400 uppercase tracking-wide">
              <li><a href="#" className="hover:text-flame-400 transition-colors">Free Fire Rules</a></li>
              <li><a href="#" className="hover:text-flame-400 transition-colors">Scoring Breakdown</a></li>
              <li><a href="#" className="hover:text-flame-400 transition-colors">Prize Pool Distribution</a></li>
              <li><a href="/admin" className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 font-bold">🛡️ Staff Operations Hub ↗</a></li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="font-orbitron text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-amber-gold inline-block" />
              Competitive Circuit
            </h4>
            <div className="bg-panther-900 border border-panther-800 p-4 rounded clip-hud-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Current Season:</span>
                <span className="font-orbitron font-bold text-amber-gold">SEASON 1</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Format:</span>
                <span className="font-rajdhani font-bold text-white">BR Squad & Duo</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Slot Engine:</span>
                <span className="font-mono text-[11px] text-emerald-400">P2P Low-Latency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="border-t border-panther-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Panthers Esports. All rights reserved.</p>
          <p className="text-center sm:text-right max-w-xl text-[11px]">
            Disclaimer: Panthers Esports is an independent tournament organizer. Free Fire is a registered trademark of Garena International. This platform is not endorsed by or affiliated with Garena.
          </p>
        </div>
      </div>
    </footer>
  );
};
