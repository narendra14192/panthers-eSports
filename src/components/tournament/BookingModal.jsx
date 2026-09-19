import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import {
  Shield, AlertCircle, CheckCircle2, Flame, Users, Phone, Hash, Plus, Trash2,
  IndianRupee, QrCode, Copy, Check, Smartphone, ArrowRight, ArrowLeft, Clock,
  BadgeCheck, AlertTriangle, Zap, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── UPI Config ──────────────────────────────────────────────────────────────
const UPI_CONFIG = {
  upiId: 'narendrabk@fam',
  name: 'Panthers Esports',
  amount: 50,
  note: 'Panthers Tri-Map Entry Fee',
  qrImage: '/upi-qr.png',
};

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = [
    { num: 1, label: 'Team Details' },
    { num: 2, label: 'Pay ₹50' },
    { num: 3, label: 'Confirm' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron font-black border-2 transition-all ${
              step > s.num
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : step === s.num
                  ? 'bg-flame-500 border-flame-500 text-white shadow-flame-sm animate-pulse'
                  : 'bg-panther-950 border-panther-700 text-gray-500'
            }`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-[10px] font-rajdhani font-bold mt-1 uppercase tracking-wider ${
              step === s.num ? 'text-flame-400' : step > s.num ? 'text-emerald-400' : 'text-gray-500'
            }`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-[2px] mx-2 mb-4 transition-all ${step > s.num + 0 ? 'bg-emerald-500' : 'bg-panther-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Step 1: Team Details Form ───────────────────────────────────────────────
function TeamDetailsStep({ data, onChange, user }) {
  const { teamName, teamTag, captainName, captainPhone, captainUid, captainRole, players } = data;

  const handlePlayerChange = (index, field, value) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    onChange('players', updated);
  };

  const addSubstitute = () => {
    if (players.length < 4) {
      onChange('players', [...players, { name: '', uid: '', role: 'Substitute' }]);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 3) {
      onChange('players', players.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-5">
      {/* Clan & Team */}
      <div className="space-y-2">
        <h4 className="font-orbitron text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-flame-400" />
          1. Clan & Team Details
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-rajdhani font-bold text-gray-400 uppercase mb-1">Squad / Clan Name *</label>
            <input
              type="text" required
              placeholder="e.g. Panther Elites"
              value={teamName}
              onChange={e => onChange('teamName', e.target.value)}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500 font-rajdhani font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-rajdhani font-bold text-gray-400 uppercase mb-1">Tag (2-5 chars) *</label>
            <input
              type="text" required maxLength={6}
              placeholder="e.g. PNTR"
              value={teamTag}
              onChange={e => onChange('teamTag', e.target.value.toUpperCase())}
              className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-flame-500 font-orbitron uppercase"
            />
          </div>
        </div>
      </div>

      {/* Captain */}
      <div className="space-y-2">
        <h4 className="font-orbitron text-xs font-bold text-amber-gold uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-gold" />
          2. Captain (Player #1)
        </h4>
        <div className="bg-panther-950/90 border border-amber-gold/30 p-3.5 rounded clip-hud-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-rajdhani font-bold text-gray-400 uppercase mb-1">Captain IGN *</label>
            <input
              type="text" required
              placeholder="In-game Name"
              value={captainName}
              onChange={e => onChange('captainName', e.target.value)}
              className="w-full bg-panther-900 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-flame-500 font-rajdhani font-semibold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-rajdhani font-bold text-gray-400 uppercase mb-1">Free Fire UID *</label>
            <input
              type="text" required
              placeholder="9-12 digits (e.g. 182947192)"
              maxLength={12}
              value={captainUid}
              onChange={e => onChange('captainUid', e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="w-full bg-panther-900 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-amber-gold focus:outline-none focus:border-flame-500 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-rajdhani font-bold text-gray-400 uppercase mb-1">WhatsApp *</label>
            <input
              type="tel" required
              placeholder="+91 98765 43210"
              value={captainPhone}
              onChange={e => onChange('captainPhone', e.target.value)}
              className="w-full bg-panther-900 border border-panther-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-flame-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-rajdhani font-bold text-gray-400 uppercase mb-1">Role</label>
            <select
              value={captainRole}
              onChange={e => onChange('captainRole', e.target.value)}
              className="w-full bg-panther-900 border border-panther-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-flame-500 font-rajdhani"
            >
              <option value="Captain / IGL">Captain / IGL</option>
              <option value="Rusher">Rusher</option>
              <option value="Sniper">Sniper</option>
              <option value="Support">Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Squad Players */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-orbitron text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-flame-500" />
            3. Squad Members ({players.length + 1}/4 players)
          </h4>
        </div>
        <div className="space-y-2">
          {players.map((player, idx) => (
            <div key={idx} className="bg-panther-950/80 border border-panther-800 p-3 rounded clip-hud-sm grid grid-cols-12 gap-2 items-center">
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-xs font-orbitron font-black text-flame-400">#{idx + 2}</span>
                {players.length > 3 && idx >= 3 && (
                  <button type="button" onClick={() => removePlayer(idx)} className="text-gray-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="col-span-4">
                <input
                  type="text" required
                  placeholder={`Player #${idx + 2} IGN`}
                  value={player.name}
                  onChange={e => handlePlayerChange(idx, 'name', e.target.value)}
                  className="w-full bg-panther-900 border border-panther-700/80 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-flame-500 font-rajdhani font-semibold"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text" required
                  placeholder="UID (9-12 digits)"
                  maxLength={12}
                  value={player.uid}
                  onChange={e => handlePlayerChange(idx, 'uid', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full bg-panther-900 border border-panther-700/80 rounded px-2.5 py-1.5 text-xs text-amber-gold focus:outline-none focus:border-flame-500 font-mono font-bold"
                />
              </div>
              <div className="col-span-3">
                <select
                  value={player.role}
                  onChange={e => handlePlayerChange(idx, 'role', e.target.value)}
                  className="w-full bg-panther-900 border border-panther-700/80 rounded px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-flame-500 font-rajdhani"
                >
                  <option value="Rusher">Rusher</option>
                  <option value="Sniper">Sniper</option>
                  <option value="Support">Support</option>
                  <option value="Flanker">Flanker</option>
                  <option value="Substitute">Substitute</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        {players.length < 4 && (
          <button type="button" onClick={addSubstitute} className="text-xs font-rajdhani font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 pt-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Add 5th Player (Substitute)</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: UPI Payment Step ─────────────────────────────────────────────────
function PaymentStep({ slotNumber, tournament, utrValue, onUtrChange, copied, onCopyUpi }) {
  const [payTimer, setPayTimer] = useState(300); // 5 min countdown

  useEffect(() => {
    const t = setInterval(() => {
      setPayTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-5">
      {/* Payment Alert */}
      <div className="bg-amber-950/60 border border-amber-gold/50 p-3 rounded clip-hud-sm flex items-start gap-3">
        <Zap className="w-4 h-4 text-amber-gold flex-shrink-0 mt-0.5" />
        <div className="text-xs font-rajdhani font-semibold text-amber-200">
          <span className="font-bold text-amber-gold block">Slot reserved for {formatTime(payTimer)}</span>
          Complete payment now to secure Slot #{String(slotNumber).padStart(2, '0')} — it auto-releases if unpaid.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* QR Code Panel */}
        <div className="bg-panther-900 border border-panther-700 rounded clip-hud p-4 flex flex-col items-center gap-3">
          <span className="text-xs font-orbitron font-bold text-flame-400 uppercase tracking-wider">
            Scan & Pay ₹{tournament?.entry_fee || 50}
          </span>

          {/* QR Image */}
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-flame-500/60 shadow-flame-sm bg-panther-950 p-1 flex items-center justify-center">
            <img
              src={UPI_CONFIG.qrImage}
              alt="UPI QR Code"
              className="w-full h-full object-contain rounded"
              onError={e => {
                // fallback to a generated QR via qrserver API
                e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${UPI_CONFIG.upiId}&pn=${encodeURIComponent(UPI_CONFIG.name)}&am=${tournament?.entry_fee || UPI_CONFIG.amount}&cu=INR&tn=${encodeURIComponent(`Slot ${slotNumber} - ${tournament?.title || 'Panthers'}`)}`)}`;
              }}
            />
            {/* Overlay corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-flame-400 pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-flame-400 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-flame-400 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-flame-400 pointer-events-none" />
          </div>

          {/* App icons */}
          <div className="flex items-center gap-2.5 text-[10px] font-rajdhani font-bold text-gray-400 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-indigo-400" />PhonePe</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-green-400" />GPay</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-sky-400" />Paytm</span>
            <span>·</span>
            <span className="text-amber-400 font-bold">FamPay</span>
          </div>

          {/* Direct UPI pay link for mobile users */}
          <a
            href={`upi://pay?pa=${UPI_CONFIG.upiId}&pn=${encodeURIComponent(UPI_CONFIG.name)}&am=${tournament?.entry_fee || UPI_CONFIG.amount}&cu=INR&tn=${encodeURIComponent(`Slot ${slotNumber} - ${tournament?.title || 'Panthers'}`)}`}
            className="w-full text-center py-2 px-3 bg-panther-800 hover:bg-flame-600 border border-panther-700 hover:border-flame-500 text-gray-200 hover:text-white font-rajdhani font-bold text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-flame-400" />
            Pay via UPI App Directly
          </a>
        </div>

        {/* UPI ID & Instructions */}
        <div className="flex flex-col gap-4">
          {/* Amount Card */}
          <div className="bg-panther-950 border border-panther-700 rounded clip-hud-sm p-3 text-center">
            <span className="text-[10px] font-rajdhani text-gray-400 uppercase block">Amount to Pay</span>
            <span className="text-3xl font-orbitron font-black text-amber-gold">₹{tournament?.entry_fee || 50}</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Panthers Tri-Map Entry · Slot #{String(slotNumber).padStart(2,'0')}</span>
          </div>

          {/* UPI ID Copy */}
          <div className="bg-panther-950 border border-panther-700 rounded clip-hud-sm p-3 space-y-2">
            <span className="text-[10px] font-rajdhani font-bold text-gray-400 uppercase block">UPI ID (Manual Pay)</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono font-bold text-cyan-300 bg-panther-900 px-2.5 py-1.5 rounded border border-panther-700 truncate">
                {UPI_CONFIG.upiId}
              </code>
              <button
                type="button"
                onClick={onCopyUpi}
                className="flex-shrink-0 w-8 h-8 rounded bg-panther-800 hover:bg-panther-700 border border-panther-700 flex items-center justify-center transition-colors"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-sans">Send exactly <strong className="text-amber-gold">₹{tournament?.entry_fee || 50}</strong> with note: <strong className="text-white">Slot {slotNumber}</strong></p>
          </div>

          {/* Steps */}
          <div className="text-xs font-rajdhani font-semibold text-gray-300 space-y-1.5">
            {[
              { icon: '1️⃣', text: 'Open PhonePe / GPay / Paytm' },
              { icon: '2️⃣', text: `Scan QR or pay to UPI ID` },
              { icon: '3️⃣', text: `Pay exactly ₹${tournament?.entry_fee || 50} — note: "Slot ${slotNumber}"` },
              { icon: '4️⃣', text: 'Copy the 12-digit UTR/Ref number' },
              { icon: '5️⃣', text: 'Paste it below & confirm' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span>{s.icon}</span>
                <span>{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UTR Input */}
      <div className="space-y-2">
        <label className="block text-xs font-rajdhani font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-400" />
          UTR / Transaction Reference Number *
        </label>
        <input
          type="text"
          required
          placeholder="Enter 12-digit UTR number (e.g. 427381920847)"
          value={utrValue}
          onChange={e => onUtrChange(e.target.value.replace(/\D/g, '').slice(0, 12))}
          maxLength={12}
          className="w-full bg-panther-950 border border-panther-700 rounded px-4 py-3 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500 tracking-widest"
        />
        <p className="text-[11px] text-gray-500 font-sans">
          Found in your UPI app → Transactions → Payment receipt (12 digits). Your slot is locked only after admin verifies this.
        </p>
      </div>

      {/* Warning */}
      <div className="bg-red-950/40 border border-red-500/30 p-3 rounded clip-hud-sm flex items-start gap-2 text-xs text-red-300 font-rajdhani">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <span>Wrong UTR or fake payment = immediate slot cancellation & ban. Payment is verified by admin before room credentials are shared.</span>
      </div>
    </div>
  );
}

// ─── Step 3: Confirmation Summary ─────────────────────────────────────────────
function ConfirmationStep({ data, slotNumber, tournament, utr }) {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/50">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-orbitron font-black text-white uppercase">Almost There!</h3>
        <p className="text-xs text-gray-400 font-sans">Review your registration below, then click "Lock My Slot" to finalize.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-rajdhani">
        {/* Slot & Tournament */}
        <div className="bg-panther-950 border border-panther-800 p-4 rounded clip-hud-sm space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Slot Details</p>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-400">Slot Number</span><span className="font-bold text-flame-400">#{String(slotNumber).padStart(2, '0')}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Tournament</span><span className="font-bold text-white text-right">Tri-Map Championship</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Maps</span><span className="font-bold text-amber-gold">Bermuda → Purg → Kalahari</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Date</span><span className="font-bold text-white">{tournament?.date}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Start Time</span><span className="font-bold text-white">{tournament?.time} IST</span></div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded clip-hud-sm space-y-2">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Payment Info</p>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-400">Amount Paid</span><span className="font-orbitron font-black text-emerald-400">₹{tournament?.entry_fee || 50}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">UTR Number</span><span className="font-mono font-bold text-white tracking-widest">{utr || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="font-bold text-yellow-400">⏳ Pending Verification</span></div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Admin will verify your UTR and release room credentials to your WhatsApp before match start.</p>
        </div>

        {/* Team */}
        <div className="sm:col-span-2 bg-panther-950 border border-panther-800 p-4 rounded clip-hud-sm space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team Roster</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: data.captainName, uid: data.captainUid, role: data.captainRole, isCapt: true },
              ...data.players.map(p => ({ name: p.name, uid: p.uid, role: p.role, isCapt: false }))
            ].map((p, i) => (
              <div key={i} className="bg-panther-900 border border-panther-700 p-2 rounded text-center">
                <div className={`w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold ${p.isCapt ? 'bg-amber-gold/20 border border-amber-gold/60 text-amber-gold' : 'bg-flame-500/20 border border-flame-500/40 text-flame-400'}`}>
                  {p.name?.[0] || '?'}
                </div>
                <p className="font-bold text-white text-[11px] truncate">{p.name || '—'}</p>
                <p className="text-[10px] text-amber-gold font-mono">{p.uid || '—'}</p>
                <p className="text-[10px] text-gray-500">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main BookingModal with Payment Flow ──────────────────────────────────────
export const BookingModal = ({
  isOpen, onClose, tournament, slotNumber, onBookingSuccess
}) => {
  const { user } = useAuth();
  const { bookSlot } = useTournaments();

  const [step, setStep] = useState(1); // 1=team details, 2=payment, 3=confirm

  // Form state
  const [formData, setFormData] = useState({
    teamName: user?.team_name || '',
    teamTag: user?.team_tag || '',
    captainName: user?.in_game_name || '',
    captainPhone: user?.phone || '',
    captainUid: user?.free_fire_uid || '',
    captainRole: 'Captain / IGL',
    players: [
      { name: '', uid: '', role: 'Rusher' },
      { name: '', uid: '', role: 'Sniper' },
      { name: '', uid: '', role: 'Support' },
    ],
  });

  const [utr, setUtr] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const submittingRef = useRef(false);

  // Sync user data on open
  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        teamName: user.team_name || prev.teamName,
        teamTag: user.team_tag || prev.teamTag,
        captainName: user.in_game_name || prev.captainName,
        captainPhone: user.phone || prev.captainPhone,
        captainUid: user.free_fire_uid || prev.captainUid,
      }));
      if (user.in_game_name === 'PNTR Shadow') {
        setFormData(prev => ({
          ...prev,
          players: [
            { name: 'PNTR Venom', uid: '293847102', role: 'Sniper' },
            { name: 'PNTR Blaze', uid: '482910394', role: 'Rusher' },
            { name: 'PNTR Ghost', uid: '958271039', role: 'Support' },
          ]
        }));
      }
    }
    setStep(1);
    setUtr('');
    setError('');
  }, [isOpen, user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateUID = uid => /^\d{9,12}$/.test(uid.trim());

  // Step 1 → 2 validation
  const handleNextToPayment = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.teamName.trim()) { setError('Please enter your Clan / Team Name.'); return; }
    if (!formData.teamTag.trim()) { setError('Please enter a Clan Tag (2-5 chars).'); return; }
    if (!formData.captainName.trim()) { setError('Captain In-Game Name is required.'); return; }
    if (!formData.captainPhone.trim()) { setError('Captain WhatsApp number is required.'); return; }
    if (!validateUID(formData.captainUid)) { setError('Captain Free Fire UID must be 9-12 numeric digits.'); return; }
    for (let i = 0; i < formData.players.length; i++) {
      const p = formData.players[i];
      if (!p.name.trim()) { setError(`Player #${i + 2} In-Game Name is required.`); return; }
      if (!validateUID(p.uid)) { setError(`Player #${i + 2} (${p.name || 'Member'}) Free Fire UID must be 9-12 numeric digits.`); return; }
    }
    setStep(2);
  };

  // Step 2 → 3 validation
  const handleNextToConfirm = (e) => {
    e.preventDefault();
    setError('');
    if (!utr.trim() || utr.length < 10) {
      setError('Please enter your valid 10-12 digit UTR / Transaction Reference Number.');
      return;
    }
    setStep(3);
  };

  // Final Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError('');

    try {
      const squadRoster = [
        { name: formData.captainName.trim(), uid: formData.captainUid.trim(), role: formData.captainRole },
        ...formData.players.map((p, i) => ({ name: p.name.trim(), uid: p.uid.trim(), role: p.role || `Player #${i + 2}` }))
      ];

      const registrationData = {
        team_id: user?.team_id || null,
        team_name: formData.teamName.trim(),
        team_tag: formData.teamTag.trim().toUpperCase(),
        captain_user_id: user?.id || null,
        captain_name: formData.captainName.trim(),
        captain_phone: formData.captainPhone.trim(),
        captain_uid: formData.captainUid.trim(),
        players: squadRoster,
        payment: {
          utr: utr.trim(),
          amount: tournament?.entry_fee || 50,
          method: 'UPI',
          status: 'pending_verification',
          submitted_at: new Date().toISOString(),
        }
      };

      const result = await bookSlot(tournament.id, slotNumber, registrationData);

      if (!result?.success) {
        setError(result?.error || 'Booking failed. Please try again.');
        setIsSubmitting(false);
        submittingRef.current = false;
        return;
      }

      // 🎉 Confetti
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors: ['#FF4D00', '#FFB800', '#00F0FF'] });
      } catch { /* ignore */ }

      onBookingSuccess({
        slotNumber,
        tournament,
        teamName: registrationData.team_name,
        teamTag: registrationData.team_tag,
        captainName: registrationData.captain_name,
        roster: squadRoster,
        utr: utr.trim(),
      });

      onClose();
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_CONFIG.upiId).catch(() => {});
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getTitle = () => {
    if (step === 1) return `REGISTER TEAM // SLOT #${String(slotNumber).padStart(2, '0')}`;
    if (step === 2) return `PAYMENT // SLOT #${String(slotNumber).padStart(2, '0')}`;
    return `CONFIRM & LOCK // SLOT #${String(slotNumber).padStart(2, '0')}`;
  };

  if (!user && isOpen) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="SIGN IN REQUIRED"
        subtitle="Authentication is required to book a tournament slot"
        maxWidth="max-w-md"
      >
        <div className="p-4 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-flame-500/20 text-flame-400 flex items-center justify-center mx-auto border border-flame-500/40">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-orbitron font-bold text-white text-base">Please Sign In or Register</h3>
          <p className="text-xs text-gray-400">
            You must have a registered player profile to secure Slot #{String(slotNumber).padStart(2, '0')}.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 border-t border-panther-800">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                sessionStorage.setItem('panthers_pending_slot', JSON.stringify({
                  tournamentId: tournament?.id,
                  slotNumber
                }));
                onClose();
                window.location.hash = '#/login';
              }}
            >
              Sign In / Register
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      subtitle={`${tournament?.name} • Bermuda → Purgatory → Kalahari (3 Matches)`}
      maxWidth="max-w-3xl"
    >
      <StepBar step={step} />

      {error && (
        <div className="bg-red-950/80 border border-red-500/80 p-3 rounded clip-hud-sm flex items-start gap-3 text-red-300 text-xs mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Team Details */}
      {step === 1 && (
        <form onSubmit={handleNextToPayment} className="space-y-4">
          <TeamDetailsStep data={formData} onChange={handleChange} user={user} />
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-panther-800">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" icon={ArrowRight} className="min-w-[180px]">
              Next: Pay ₹{tournament?.entry_fee || 50}
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: Payment */}
      {step === 2 && (
        <form onSubmit={handleNextToConfirm} className="space-y-4">
          <PaymentStep
            slotNumber={slotNumber}
            tournament={tournament}
            utrValue={utr}
            onUtrChange={setUtr}
            copied={copiedUpi}
            onCopyUpi={handleCopyUpi}
          />
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-panther-800">
            <Button type="button" variant="ghost" icon={ArrowLeft} onClick={() => { setStep(1); setError(''); }}>
              Back
            </Button>
            <Button type="submit" variant="primary" icon={ArrowRight} className="min-w-[180px]">
              Verify & Continue
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: Confirm */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <ConfirmationStep data={formData} slotNumber={slotNumber} tournament={tournament} utr={utr} />
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-panther-800">
            <Button type="button" variant="ghost" icon={ArrowLeft} onClick={() => { setStep(2); setError(''); }}>
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-w-[200px] justify-center"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locking Slot...</span>
                </span>
              ) : (
                `🔒 Lock Slot #${slotNumber} — Confirm`
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
