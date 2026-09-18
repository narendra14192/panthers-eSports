import React, { useState, useEffect } from 'react';
import { useTournaments } from '../context/TournamentContext';
import { useAuth } from '../context/AuthContext';
import { SlotGrid } from '../components/tournament/SlotGrid';
import { BookingModal } from '../components/tournament/BookingModal';
import { BookingConfirmationModal } from '../components/tournament/BookingConfirmationModal';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../lib/scoring';
import { Calendar, Clock, MapPin, Trophy, Shield, Key, ArrowLeft, Users, AlertCircle, Share2, Lock } from 'lucide-react';

export const TournamentDetailPage = ({ tournamentId, onBack, onNavigate }) => {
  const { tournaments, getTournamentSlots, getTournamentLeaderboard } = useTournaments();
  const { user } = useAuth();

  const tournament = tournaments.find(t => t.id === tournamentId);

  const [activeTab, setActiveTab] = useState('slots'); // 'slots' | 'leaderboard' | 'rules'
  const [selectedSlotNumber, setSelectedSlotNumber] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-2xl font-orbitron font-bold text-white">Tournament Not Found</h2>
        <Button variant="outline" onClick={onBack} icon={ArrowLeft}>
          Back to Tournaments
        </Button>
      </div>
    );
  }

  const slots = getTournamentSlots(tournament.id);
  const mySlot = slots.find(s => s.team_id && s.team_id === user?.team_id);
  const tournamentStandings = getTournamentLeaderboard(tournament.id);

  // Resume pending slot selection after login
  useEffect(() => {
    if (user && tournament) {
      try {
        const pendingRaw = sessionStorage.getItem('panthers_pending_slot');
        if (pendingRaw) {
          const { tournamentId: pendingTourneyId, slotNumber } = JSON.parse(pendingRaw);
          if (pendingTourneyId === tournament.id) {
            sessionStorage.removeItem('panthers_pending_slot');
            setSelectedSlotNumber(slotNumber);
            setIsBookingModalOpen(true);
          }
        }
      } catch { /* ignore */ }
    }
  }, [user, tournament]);

  const handleSelectSlot = (slotNumber) => {
    if (!user) {
      // Not logged in: save intended slot and redirect to login page
      sessionStorage.setItem('panthers_pending_slot', JSON.stringify({
        tournamentId: tournament.id,
        slotNumber
      }));
      onNavigate?.('login');
      return;
    }
    setSelectedSlotNumber(slotNumber);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = (bookingDetails) => {
    setConfirmedBooking(bookingDetails);
    setIsConfirmationOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-rajdhani font-bold text-gray-400 hover:text-white uppercase transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-flame-400" />
        <span>Back to Tournaments</span>
      </button>

      {/* Hero Tournament Banner Card */}
      <div className="relative bg-panther-900 border border-panther-800 rounded clip-hud overflow-hidden shadow-card-dark">
        {/* Banner image with dark overlay */}
        <div className="relative h-60 sm:h-72 w-full bg-panther-950 overflow-hidden">
          <img
            src={tournament.banner_url}
            alt={tournament.name}
            className="w-full h-full object-cover object-center filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-panther-900 via-panther-900/60 to-panther-950/40" />

          {/* Badges on Top */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <Badge status={tournament.status} size="lg" />
            <span className="bg-panther-950/90 text-white font-rajdhani font-bold text-xs px-3 py-1 rounded clip-hud-sm uppercase border border-panther-700">
              {tournament.mode} (4v4)
            </span>
            <span className="bg-panther-950/90 text-amber-gold font-rajdhani font-bold text-xs px-3 py-1 rounded clip-hud-sm uppercase border border-amber-gold/40 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {tournament.map}
            </span>
          </div>

          {/* Prize pool spotlight */}
          <div className="absolute top-4 right-4 bg-panther-950/90 border border-amber-gold/50 p-3 rounded clip-hud-sm text-right backdrop-blur-md">
            <span className="text-[10px] font-rajdhani uppercase text-gray-400 font-bold block">
              Total Prize Pool
            </span>
            <span className="text-2xl sm:text-3xl font-orbitron font-black text-gold-gradient">
              {tournament.prize_pool > 0 ? formatCurrency(tournament.prize_pool) : 'FREE ENTRY'}
            </span>
          </div>

          {/* Tournament title in banner */}
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl sm:text-4xl font-orbitron font-black text-white uppercase tracking-tight">
              {tournament.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-2xl mt-1">
              {tournament.description}
            </p>
          </div>
        </div>

        {/* Tournament Meta Strip */}
        <div className="p-4 sm:p-5 bg-panther-850/70 border-t border-panther-800 flex flex-wrap items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-rajdhani">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4 text-flame-400" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Date</span>
                <span className="font-bold text-white text-sm">{tournament.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-flame-400" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Start Time</span>
                <span className="font-bold text-white text-sm">{tournament.time} IST</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <Trophy className="w-4 h-4 text-amber-gold" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Entry Fee</span>
                <span className="font-bold text-amber-gold text-sm">
                  ₹{tournament.entry_fee} / slot
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">Capacity</span>
                <span className="font-bold text-white text-sm">
                  {slots.filter(s => s.status !== 'open').length} / {tournament.total_slots} Slots Booked
                </span>
              </div>
            </div>
          </div>

          {/* User slot banner if registered */}
          {mySlot ? (
            <div className="bg-amber-950/70 border border-amber-gold/50 px-4 py-2 rounded clip-hud-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-gold animate-ping" />
              <span className="text-xs font-rajdhani font-bold text-amber-gold uppercase">
                Your Squad is Booked in Slot #{mySlot.slot_number}
              </span>
            </div>
          ) : (
            <div className="text-xs font-rajdhani text-gray-400">
              {user ? (
                `Select an open slot from the ${tournament.total_slots || 12} slots below to register`
              ) : (
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Sign in or register to select and book a slot
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3 Matches Back-to-Back Schedule Bar */}
        <div className="bg-panther-950 border-t border-panther-800 px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-orbitron font-bold text-flame-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-flame-500" /> 3 Back-to-Back Matches Rotation
            </span>
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              <div className="bg-panther-900 border border-amber-gold/30 px-3 py-1.5 rounded clip-hud-sm text-center">
                <span className="text-[9px] font-orbitron font-bold text-amber-gold uppercase block">MATCH 1</span>
                <span className="text-xs font-bold text-white">Bermuda</span>
              </div>
              <div className="bg-panther-900 border border-flame-500/30 px-3 py-1.5 rounded clip-hud-sm text-center">
                <span className="text-[9px] font-orbitron font-bold text-flame-400 uppercase block">MATCH 2</span>
                <span className="text-xs font-bold text-white">Purgatory</span>
              </div>
              <div className="bg-panther-900 border border-cyan-500/30 px-3 py-1.5 rounded clip-hud-sm text-center">
                <span className="text-[9px] font-orbitron font-bold text-cyan-400 uppercase block">MATCH 3</span>
                <span className="text-xs font-bold text-white">Kalahari</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Access Alert if live or upcoming */}
      {tournament.room_id && (
        <div className="bg-gradient-to-r from-cyan-950/60 to-panther-900 border border-cyan-500/50 p-4 rounded clip-hud-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-cyan-glow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-wider block">
                Official Custom Room Credentials Released!
              </span>
              <span className="text-xs text-gray-300">
                Join Free Fire room 15 minutes before match start.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-panther-950/80 px-4 py-2 rounded border border-panther-800">
            <div>
              <span className="text-[10px] font-rajdhani text-gray-400 uppercase block">Room ID</span>
              <span className="font-mono font-bold text-cyan-300 text-sm">{tournament.room_id}</span>
            </div>
            <div className="border-l border-panther-700 pl-4">
              <span className="text-[10px] font-rajdhani text-gray-400 uppercase block">Password</span>
              <span className="font-mono font-bold text-amber-gold text-sm">{tournament.room_password}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Slots / Standings / Rules) */}
      <div className="flex items-center gap-2 border-b border-panther-800 pb-2 text-sm font-rajdhani font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('slots')}
          className={`px-5 py-2.5 rounded clip-hud-sm transition-all ${
            activeTab === 'slots'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Live Slot Grid ({slots.filter(s => s.status === 'open').length} Open)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`px-5 py-2.5 rounded clip-hud-sm transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Match Standings
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-2.5 rounded clip-hud-sm transition-all ${
            activeTab === 'rules'
              ? 'bg-flame-500 text-white shadow-flame-sm'
              : 'text-gray-400 hover:text-white hover:bg-panther-850'
          }`}
        >
          Rules & Regulations
        </button>
      </div>

      {/* Tab 1: Live Interactive Slot Grid */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <SlotGrid
            tournament={tournament}
            onSelectSlot={handleSelectSlot}
            selectedSlotNumber={selectedSlotNumber}
          />
        </div>
      )}

      {/* Tab 2: Tournament Standings */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <LeaderboardTable
            entries={tournamentStandings}
            selectedFilter={tournament.id}
            onFilterChange={() => {}}
            tournaments={[tournament]}
          />
        </div>
      )}

      {/* Tab 3: Rules & Prize Breakdown */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-panther-900 border border-panther-800 p-6 rounded clip-hud space-y-4">
            <h3 className="font-orbitron font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-flame-400" />
              Tournament Competitive Rules
            </h3>
            <div className="text-xs text-gray-300 font-sans space-y-2 whitespace-pre-line leading-relaxed">
              {tournament.rules || 'Standard Free Fire competitive rules apply.'}
            </div>
          </div>

          <div className="bg-panther-900 border border-panther-800 p-6 rounded clip-hud space-y-4">
            <h3 className="font-orbitron font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-gold" />
              Prize Pool Breakdown
            </h3>
            <div className="space-y-2.5 text-xs font-rajdhani font-semibold">
              <div className="flex items-center justify-between p-2.5 bg-panther-950 rounded border border-amber-gold/30">
                <span className="font-bold text-amber-gold">1st Place (Champion)</span>
                <span className="font-orbitron font-black text-white text-sm">
                  {tournament.prize_distribution?.['1st'] || '50% Prize Pool'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-panther-950 rounded border border-slate-700">
                <span className="font-bold text-slate-300">2nd Place (Runner Up)</span>
                <span className="font-orbitron font-bold text-white text-sm">
                  {tournament.prize_distribution?.['2nd'] || '30% Prize Pool'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-panther-950 rounded border border-amber-900/50">
                <span className="font-bold text-amber-600">3rd Place</span>
                <span className="font-orbitron font-bold text-white text-sm">
                  {tournament.prize_distribution?.['3rd'] || '20% Prize Pool'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedSlotNumber && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedSlotNumber(null);
          }}
          tournament={tournament}
          slotNumber={selectedSlotNumber}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        bookingDetails={confirmedBooking}
        onGoToBookings={() => onNavigate('my-bookings')}
      />
    </div>
  );
};
