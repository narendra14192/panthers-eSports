import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import { AdminPortal } from './pages/admin/AdminPortal';
import { AnimatedBackground } from './components/common/AnimatedBackground';

function AdminContent() {
  const handleExitToPublic = () => {
    window.location.href = '/';
  };

  return (
    <div className="relative min-h-screen bg-panther-950 text-gray-100 font-sans selection:bg-red-500 selection:text-white">
      {/* Dedicated Tactical Staff Operations Background */}
      <AnimatedBackground variant="tactical" />

      {/* Main Admin Console Container */}
      <div className="relative z-10">
        <AdminPortal onExitToPublic={handleExitToPublic} />
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <AdminContent />
      </TournamentProvider>
    </AuthProvider>
  );
}
