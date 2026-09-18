import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { TournamentsPage } from './pages/TournamentsPage';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { PlayerHubPage } from './pages/PlayerHubPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPortal } from './pages/admin/AdminPortal';
import { AnimatedBackground } from './components/common/AnimatedBackground';
import { ChatBot } from './components/common/ChatBot';

export function AppContent() {
  const { user, isAdmin } = useAuth();

  // Support distinct URL hash routing for dedicated separate Admin and Player pages
  const [currentTab, setCurrentTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#/admin' || path === '/admin') {
        window.location.href = '/admin';
        return 'home';
      }
      if (hash === '#/login' || path === '/login') return 'login';
      if (hash === '#/player' || path === '/player' || hash === '#/profile') return 'player';
      if (hash === '#/leaderboard') return 'leaderboard';
      if (hash === '#/tournaments') return 'tournaments';
    }
    return 'home';
  });

  const [selectedTournament, setSelectedTournament] = useState(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') {
        window.location.href = '/admin';
      } else if (hash === '#/login') {
        setCurrentTab('login');
      } else if (hash === '#/player' || hash === '#/profile') {
        setCurrentTab('player');
      } else if (hash === '#/tournaments') {
        setCurrentTab('tournaments');
      } else if (hash === '#/leaderboard') {
        setCurrentTab('leaderboard');
      } else if (hash === '' || hash === '#/' || hash === '#/home') {
        setCurrentTab('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tab) => {
    if (tab === 'admin') {
      window.location.href = '/admin';
      return;
    }
    setCurrentTab(tab);
    if (tab === 'login') {
      window.location.hash = '#/login';
    } else if (tab === 'player') {
      window.location.hash = '#/player';
    } else if (tab === 'home') {
      window.location.hash = '';
    } else {
      window.location.hash = `#/${tab}`;
    }
  };

  const handleSelectTournament = (tourney) => {
    setSelectedTournament(tourney);
    if (tourney) {
      setCurrentTab('tournament-detail');
      window.location.hash = `#/tournament/${tourney.id}`;
    }
  };

  // Fallback if rendered on admin tab
  if (currentTab === 'admin') {
    window.location.href = '/admin';
    return null;
  }

  // 2. PUBLIC PLAYER (CUSTOMER) PLATFORM
  return (
    <div className="relative min-h-screen flex flex-col bg-panther-950 text-gray-100 font-sans selection:bg-flame-500 selection:text-white">
      {/* High-Energy Free Fire Battle Royale Animated Background */}
      <AnimatedBackground variant="battlefield" />

      {/* Public Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigate}
        onSelectTournament={setSelectedTournament}
      />

      {/* Main Public Content Area */}
      <main className="flex-1 relative z-10">
        {currentTab === 'login' && (
          <LoginPage
            onLoginSuccess={(role) => {
              if (role === 'admin') handleNavigate('admin');
              else handleNavigate('player');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectTournament={handleSelectTournament}
          />
        )}

        {currentTab === 'tournaments' && (
          <TournamentsPage
            onSelectTournament={handleSelectTournament}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'tournament-detail' && selectedTournament && (
          <TournamentDetailPage
            tournamentId={selectedTournament.id}
            onBack={() => {
              handleNavigate('tournaments');
              setSelectedTournament(null);
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardPage />
        )}

        {currentTab === 'player' && (
          <PlayerHubPage
            onNavigate={handleNavigate}
            onSelectTournament={handleSelectTournament}
          />
        )}
      </main>

      {/* Public Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Panther Bot — Floating Chat Assistant */}
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <AppContent />
      </TournamentProvider>
    </AuthProvider>
  );
}
