import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckCircle2, QrCode, Shield, Download, ArrowRight, Share2 } from 'lucide-react';

export const BookingConfirmationModal = ({
  isOpen,
  onClose,
  bookingDetails,
  onGoToBookings
}) => {
  if (!bookingDetails) return null;

  const { slotNumber, tournament, teamName, teamTag, captainName, roster, utr } = bookingDetails;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SLOT CONFIRMED!"
      subtitle="See you at the Panthers Esports Arena"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Pass Card */}
        <div className="relative bg-gradient-to-b from-panther-850 to-panther-900 border-2 border-flame-500/80 p-6 rounded clip-hud shadow-flame-md overflow-hidden">
          {/* Top Brand Stripe */}
          <div className="flex items-center justify-between border-b border-panther-700/80 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <img src="/panther-logo.svg" alt="Panther" className="w-7 h-7 object-contain" />
              <div>
                <span className="font-orbitron font-black text-white text-base tracking-wider block">
                  PANTHERS ESPORTS
                </span>
                <span className="font-rajdhani text-[10px] font-bold text-amber-gold uppercase tracking-widest block">
                  Official Match Pass
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-flame-500 text-white font-orbitron font-black text-xs px-2.5 py-1 rounded">
                SLOT #{String(slotNumber).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Tournament & Team Grid */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-rajdhani uppercase text-gray-400 font-bold block">
                Tournament
              </span>
              <h4 className="text-lg font-orbitron font-bold text-white">
                {tournament?.name}
              </h4>
              <p className="text-xs text-flame-400 font-rajdhani font-bold uppercase mt-0.5">
                {tournament?.mode} Battle Royale • {tournament?.map} • {tournament?.date} at {tournament?.time} IST
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-panther-950/80 p-3 rounded border border-panther-800">
              <div>
                <span className="text-[10px] font-rajdhani uppercase text-gray-400 block font-bold">
                  Registered Team
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-panther-800 text-amber-gold text-[10px] font-orbitron font-bold px-1.5 py-0.2 rounded">
                    {teamTag}
                  </span>
                  <span className="text-sm font-rajdhani font-bold text-white truncate">
                    {teamName}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-rajdhani uppercase text-gray-400 block font-bold">
                  Team Captain
                </span>
                <span className="text-sm font-rajdhani font-bold text-gray-200 block truncate mt-0.5">
                  {captainName}
                </span>
              </div>
            </div>

            {/* Squad Roster preview */}
            {roster && roster.length > 0 && (
              <div>
                <span className="text-[10px] font-rajdhani uppercase text-gray-400 block font-bold mb-1.5">
                  Confirmed Squad Lineup ({roster.length} Players)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roster.map((player, idx) => (
                    <div key={idx} className="bg-panther-900 border border-panther-800 p-2 rounded text-center">
                      <span className="text-[11px] font-rajdhani font-bold text-gray-200 block truncate">
                        {player.name}
                      </span>
                      <span className="text-[9px] font-mono text-gray-400 block truncate">
                        {player.uid}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Status */}
          {utr && (
            <div className="mt-3 bg-emerald-950/40 border border-emerald-500/40 p-3 rounded flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-rajdhani font-bold text-emerald-300 block">Payment Submitted</span>
                  <span className="text-gray-400 font-mono">UTR: {utr} · ⏳ Admin Verification Pending</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-yellow-400 bg-yellow-900/40 border border-yellow-500/40 px-2 py-1 rounded uppercase">Pending</span>
            </div>
          )}
        </div>

        {/* Motivational Callout */}
        <div className="text-center space-y-1">
          <p className="font-orbitron font-bold text-flame-400 text-sm">
            "Slot booked — see you at Panthers Esports Squad Showdown!"
          </p>
          <p className="text-xs text-gray-400">
            Make sure all squad members join the custom room on time.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="w-full sm:w-auto"
            icon={Download}
          >
            Save Pass
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 sm:flex-initial"
            >
              Done
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onClose();
                onGoToBookings();
              }}
              className="flex-1 sm:flex-initial"
              icon={ArrowRight}
            >
              View in My Bookings
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
