import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { Trophy, Swords, User, Menu, X, LogIn, LogOut, Shield } from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, onSelectTournament }) => {
  const { user, logout } = useAuth();
  const { slots } = useTournaments();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count user's booked slots
  const myBookedCount = slots.filter(s => s.team_id === user?.team_id).length;

  const navItems = [
    { id: 'tournaments', label: 'Tournaments', icon: Swords },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'player', label: 'Player Portal', icon: User, count: myBookedCount },
  ];

  return (
    <header className="sticky top-0 z-40 bg-panther-950/90 backdrop-blur-md border-b border-panther-800/80 shadow-lg shadow-black/50">
      {/* Top micro-bar — Live sync status & Admin shortcut */}
      <div className="bg-panther-900 border-b border-panther-800/50 px-4 py-1 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-rajdhani font-semibold text-[11px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync Active
            </span>
            <span className="text-panther-600 hidden sm:inline">|</span>
            <span className="text-gray-400 hidden sm:inline text-[11px]">
              Panthers Free Fire Tri-Map Series • 12 Slots
            </span>
          </div>

          {/* Direct Admin Portal link to separate HTML entry */}
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="flex items-center gap-1.5 text-[10px] font-orbitron font-bold uppercase text-red-300 hover:text-white bg-red-950/80 hover:bg-red-900 border border-red-600/60 px-2.5 py-0.5 rounded transition-all hover:scale-105 shadow-sm"
              title="Open Dedicated Staff Operations Console"
            >
              <Shield className="w-3 h-3 text-red-400 animate-pulse" />
              <span>Admin Portal ↗</span>
            </a>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setCurrentTab('login');
                }}
                className="flex items-center gap-1 text-[11px] font-rajdhani font-bold uppercase text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Wordmark */}
          <div
            onClick={() => { setCurrentTab('home'); onSelectTournament?.(null); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/panther-logo.svg"
                alt="Panthers Esports Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,77,0,0.5)]"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-orbitron font-black text-xl sm:text-2xl tracking-wider text-white group-hover:text-flame-400 transition-colors">
                  PANTHERS
                </span>
                <span className="font-orbitron font-black text-xl sm:text-2xl tracking-wider text-flame-500">
                  ESPORTS
                </span>
              </div>
              <span className="font-rajdhani text-[11px] font-bold text-amber-gold uppercase tracking-[0.22em] -mt-1">
                Free Fire Battle Hub
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links — Players only, no admin link */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    onSelectTournament?.(null);
                  }}
                  className={`relative px-4 py-2 font-rajdhani font-bold text-sm lg:text-base tracking-wider uppercase transition-all duration-200 flex items-center gap-2 clip-hud-sm ${
                    isActive
                      ? 'bg-panther-800 text-flame-400 border-b-2 border-flame-500 shadow-[0_0_15px_rgba(255,77,0,0.2)]'
                      : 'text-gray-300 hover:text-white hover:bg-panther-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-flame-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="bg-flame-500 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile & Login Button */}
          <div className="flex items-center gap-3">
            {user ? (
              <div
                onClick={() => setCurrentTab('player')}
                className="hidden sm:flex items-center gap-2.5 bg-panther-900 border border-panther-800 hover:border-flame-500/60 px-3 py-1.5 rounded clip-hud-sm cursor-pointer transition-colors"
                title="Go to Player Hub"
              >
                <div className="w-7 h-7 rounded bg-panther-950 border border-flame-500/40 flex items-center justify-center font-orbitron text-xs font-bold text-flame-400 overflow-hidden relative">
                  {user?.team_image || user?.avatar ? (
                    <img
                      src={user.team_image || user.avatar}
                      alt="Team"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-full h-full object-contain"
                    />
                  ) : null}
                  {(!user?.team_image && !user?.avatar) && (
                    <span>{user?.team_tag?.[0] || user?.in_game_name?.[0] || 'P'}</span>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-rajdhani font-bold text-gray-200 truncate max-w-[120px]">
                    {user?.in_game_name || 'Player'}
                  </span>
                  <span className="text-[10px] text-amber-gold font-mono">
                    UID: {user?.free_fire_uid || 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-rajdhani font-bold uppercase bg-flame-500 hover:bg-flame-400 text-white shadow-flame-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white bg-panther-900 border border-panther-800 rounded"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer — Players only, no admin link */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-panther-950 border-b border-panther-800 px-4 pt-3 pb-5 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onSelectTournament?.(null);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 font-rajdhani font-bold text-base uppercase tracking-wider rounded transition-colors ${
                  isActive ? 'bg-flame-500/20 text-flame-400 border-l-4 border-flame-500' : 'text-gray-300 hover:bg-panther-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-flame-400" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="bg-flame-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-panther-800 flex items-center justify-between">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div className="text-xs">
                    <p className="font-bold text-gray-200">{user?.in_game_name}</p>
                    <p className="text-[10px] text-amber-gold font-mono">UID: {user?.free_fire_uid}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setCurrentTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-rajdhani font-bold uppercase text-red-400 border border-red-500/40 px-3 py-1 rounded bg-red-950/40"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setCurrentTab('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-flame-500 text-white font-rajdhani font-bold text-xs uppercase rounded"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
