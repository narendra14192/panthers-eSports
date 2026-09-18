import React from 'react';
import { useTournaments } from '../context/TournamentContext';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { Button } from '../components/common/Button';
import { Swords, Trophy, Shield, Flame, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export const HomePage = ({ onNavigate, onSelectTournament }) => {
  const { tournaments } = useTournaments();

  const liveTournaments = tournaments.filter(t => t.status === 'live');
  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const featured = tournaments[0];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-20 overflow-hidden">
        {/* Ambient Background Auras */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-flame-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-gold/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Season Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panther-900 border border-flame-500/40 text-xs font-rajdhani font-bold text-flame-400 uppercase tracking-widest shadow-flame-sm">
                <span className="w-2 h-2 rounded-full bg-flame-500 animate-ping" />
                <span>Panthers Esports Free Fire Circuit 2026</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-orbitron font-black text-white tracking-tight leading-[1.08] uppercase">
                DOMINATE THE <br />
                <span className="text-flame-gradient">FREE FIRE</span> ARENA
              </h1>

              <p className="text-base sm:text-lg text-gray-300 font-sans max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Book your squad's slot in real-time, get verified custom room credentials, and climb the official Booyah leaderboard. Zero latency. Zero double-booking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => onNavigate('tournaments')}
                  icon={Swords}
                  className="w-full sm:w-auto"
                >
                  Browse Tournaments
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => onNavigate('leaderboard')}
                  icon={Trophy}
                  className="w-full sm:w-auto"
                >
                  View Season Standings
                </Button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-panther-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="text-2xl sm:text-3xl font-orbitron font-black text-white block">
                    12 Squads
                  </span>
                  <span className="text-[11px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider">
                    Official Free Fire BR
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-orbitron font-black text-flame-400 block">
                    12-Point
                  </span>
                  <span className="text-[11px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider">
                    Free Fire Scoring
                  </span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-orbitron font-black text-amber-gold block">
                    Instant
                  </span>
                  <span className="text-[11px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider">
                    Room Pass Release
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              {featured && (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-flame-500 to-amber-gold rounded-lg blur-lg opacity-40 animate-flame-pulse" />
                  <div className="relative">
                    <div className="bg-panther-900/90 border border-flame-500/60 p-2 rounded clip-hud shadow-2xl">
                      <div className="px-4 py-2 bg-panther-950 flex items-center justify-between border-b border-panther-800 mb-2">
                        <span className="text-xs font-orbitron font-bold text-flame-400 uppercase flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" /> Featured Match
                        </span>
                        <span className="text-xs font-rajdhani font-bold text-emerald-400 uppercase">
                          Slots Booking Open
                        </span>
                      </div>
                      <TournamentCard
                        tournament={featured}
                        onSelect={(t) => {
                          onSelectTournament(t);
                          onNavigate('tournament-detail');
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Live Now Matches (if any) */}
      {liveTournaments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <h2 className="text-2xl font-orbitron font-black text-white uppercase tracking-wider">
                Matches In Progress
              </h2>
            </div>
            <span className="text-xs font-rajdhani font-bold text-red-400 uppercase tracking-wider bg-red-950/80 border border-red-800 px-3 py-1 rounded">
              LIVE BATTLE ROYALE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveTournaments.map(t => (
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
        </section>
      )}

      {/* Upcoming Tournaments Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-rajdhani font-bold text-amber-gold uppercase tracking-widest block mb-1">
              Open For Registration
            </span>
            <h2 className="text-2xl sm:text-3xl font-orbitron font-black text-white uppercase tracking-wide">
              Upcoming Tournaments
            </h2>
          </div>

          <Button
            variant="outline"
            onClick={() => onNavigate('tournaments')}
            icon={ArrowRight}
          >
            View All Tournaments
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingTournaments.slice(0, 3).map(t => (
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
      </section>

      {/* How It Works (Battle Royale Flow) */}
      <section className="bg-panther-900/60 border-y border-panther-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-rajdhani font-bold text-flame-400 uppercase tracking-widest block">
              Streamlined Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-orbitron font-black text-white uppercase tracking-wide">
              How Panthers Esports Works
            </h2>
            <p className="text-sm text-gray-400 font-sans">
              From squad registration to match payout in four transparent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-panther-950 border border-panther-800 p-6 rounded clip-hud-sm space-y-3 relative group hover:border-flame-500/50 transition-colors">
              <span className="font-orbitron font-black text-3xl text-flame-500/30 group-hover:text-flame-500/60 transition-colors">
                01
              </span>
              <h3 className="font-orbitron font-bold text-base text-white">
                Pick an Open Slot
              </h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Browse tournaments and select an available slot number from the live interactive grid.
              </p>
            </div>

            <div className="bg-panther-950 border border-panther-800 p-6 rounded clip-hud-sm space-y-3 relative group hover:border-flame-500/50 transition-colors">
              <span className="font-orbitron font-black text-3xl text-flame-500/30 group-hover:text-flame-500/60 transition-colors">
                02
              </span>
              <h3 className="font-orbitron font-bold text-base text-white">
                Register Squad Roster
              </h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Enter your clan tag and squad members' Free Fire in-game names and verified player UIDs.
              </p>
            </div>

            <div className="bg-panther-950 border border-panther-800 p-6 rounded clip-hud-sm space-y-3 relative group hover:border-flame-500/50 transition-colors">
              <span className="font-orbitron font-black text-3xl text-flame-500/30 group-hover:text-flame-500/60 transition-colors">
                03
              </span>
              <h3 className="font-orbitron font-bold text-base text-white">
                Get Room ID & Pass
              </h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Custom room credentials are released exclusively to registered captains 15 minutes before drop.
              </p>
            </div>

            <div className="bg-panther-950 border border-panther-800 p-6 rounded clip-hud-sm space-y-3 relative group hover:border-flame-500/50 transition-colors">
              <span className="font-orbitron font-black text-3xl text-amber-gold/30 group-hover:text-amber-gold/60 transition-colors">
                04
              </span>
              <h3 className="font-orbitron font-bold text-base text-white">
                Claim Booyah Glory
              </h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Scores and kill points are automatically tallied onto the public leaderboard for instant payouts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
