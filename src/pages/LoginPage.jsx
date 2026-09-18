import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { PRESET_TEAM_LOGOS } from '../lib/teamLogos';
import {
  User,
  Shield,
  Lock,
  Mail,
  Phone,
  Hash,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Flame,
  KeyRound,
  Loader2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const LoginPage = ({ onLoginSuccess, onNavigate }) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    loginAsAdmin
  } = useAuth();

  const [authMode, setAuthMode] = useState('player-signin'); // 'player-signin' | 'player-signup' | 'admin-login'

  // Player sign-in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Player sign-up state
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [newIgn, setNewIgn] = useState('');
  const [newUid, setNewUid] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTag, setNewTeamTag] = useState('');
  const [teamImage, setTeamImage] = useState(PRESET_TEAM_LOGOS[0].svg);

  // Admin passcode state
  const [adminPasscode, setAdminPasscode] = useState('');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle image upload from computer
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Team logo image file size should be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setTeamImage(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // 1. Player Firebase Email & Password Sign-In
  const handlePlayerSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signInEmail.trim()) {
      setError('Please enter your account email address.');
      return;
    }
    if (!signInPassword) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    const result = await loginWithEmail(signInEmail.trim(), signInPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess('Signed in successfully! Loading player profile...');
    setTimeout(() => {
      onLoginSuccess?.('player');
      onNavigate?.('player');
    }, 500);
  };

  // 2. Player Firebase Registration with IGN, UID, Squad, and Team Image
  const handlePlayerSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signUpEmail.trim()) {
      setError('Email address is required for Firebase authentication.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!newIgn.trim()) {
      setError('In-Game Name (IGN) is required.');
      return;
    }
    if (!/^\d{9,12}$/.test(newUid.trim())) {
      setError('Free Fire UID must be 9-12 numeric digits.');
      return;
    }
    if (!newPhone.trim()) {
      setError('WhatsApp Phone number is required for room ID/password notifications.');
      return;
    }

    setLoading(true);
    const result = await registerWithEmail(signUpEmail.trim(), signUpPassword, {
      in_game_name: newIgn.trim(),
      free_fire_uid: newUid.trim(),
      phone: newPhone.trim(),
      team_name: newTeamName.trim() || `${newIgn}'s Squad`,
      team_tag: newTeamTag.trim().toUpperCase() || 'PNTR',
      team_image: teamImage || null
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess('Account created and verified! Redirecting to Tournaments...');
    setTimeout(() => {
      onLoginSuccess?.('player');
      onNavigate?.('tournaments');
    }, 600);
  };

  // 3. Google Sign-In with Popup
  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const result = await loginWithGoogle({ team_image: teamImage });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess('Google authorization verified! Welcome to Panthers Esports.');
    setTimeout(() => {
      onLoginSuccess?.('player');
      onNavigate?.('player');
    }, 500);
  };

  // 4. Staff Admin Passkey Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = loginAsAdmin(adminPasscode);
    if (!res.success) {
      setError(res.error || 'Access Denied.');
      return;
    }

    setSuccess('Staff Authorization Key Verified. Access Granted.');
    setTimeout(() => {
      onLoginSuccess?.('admin');
      onNavigate?.('admin');
    }, 400);
  };

  // 5. Send Password Reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your registered email address.');
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(resetEmail.trim());
    setIsResetting(false);

    if (!res.success) {
      setResetError(res.error);
    } else {
      setResetMessage('Password reset link sent! Please check your email inbox.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-panther-900/90 border border-panther-800 rounded clip-hud p-6 sm:p-8 shadow-card-dark relative overflow-hidden backdrop-blur-xl animate-in fade-in duration-200">
        {/* Top Flame Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-flame-600 via-amber-gold to-flame-600" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src="/panther-logo.svg" alt="Panthers" className="w-9 h-9 object-contain" />
            <span className="font-orbitron font-black text-xl tracking-wider text-white">
              PANTHERS ESPORTS
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-orbitron font-bold text-gray-200 uppercase tracking-wide">
            {authMode === 'admin-login' ? 'Staff Command Login' : 'Athlete Firebase Auth'}
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            {authMode === 'admin-login'
              ? 'Enter referee authorization key to access operations console.'
              : 'Sign in to reserve slots, manage squad rosters, and unlock room credentials.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-panther-950 p-1 rounded clip-hud-sm mb-6 border border-panther-800 text-xs font-rajdhani font-bold uppercase">
          <button
            type="button"
            onClick={() => { setAuthMode('player-signin'); setError(''); }}
            className={`py-2 px-1 text-center rounded transition-colors ${
              authMode === 'player-signin'
                ? 'bg-flame-500 text-white shadow-flame-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Player Login
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('player-signup'); setError(''); }}
            className={`py-2 px-1 text-center rounded transition-colors ${
              authMode === 'player-signup'
                ? 'bg-flame-500 text-white shadow-flame-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register Profile
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('admin-login'); setError(''); }}
            className={`py-2 px-1 text-center rounded transition-colors ${
              authMode === 'admin-login'
                ? 'bg-red-600 text-white shadow-flame-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Staff Access
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="bg-red-950/80 border border-red-500 p-3 rounded clip-hud-sm text-xs text-red-300 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/80 border border-emerald-500 p-3 rounded clip-hud-sm text-xs text-emerald-300 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* 1. PLAYER SIGN IN FORM */}
        {authMode === 'player-signin' && (
          <div className="space-y-4">
            {/* Quick Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-panther-950 hover:bg-panther-800 text-white border border-panther-700 py-2.5 px-4 rounded font-rajdhani font-bold text-sm uppercase tracking-wide transition-all shadow-sm hover:border-flame-500 group disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-panther-800" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">or sign in with email</span>
              <div className="flex-1 h-px bg-panther-800" />
            </div>

            <form onSubmit={handlePlayerSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="athlete@domain.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded pl-9 pr-3 py-2 text-sm text-white font-rajdhani font-bold focus:outline-none focus:border-flame-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(signInEmail);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-rajdhani font-semibold text-flame-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-flame-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center"
                disabled={loading}
                icon={loading ? Loader2 : ArrowRight}
              >
                {loading ? 'Authenticating...' : 'Sign In as Athlete'}
              </Button>

              <div className="pt-2 text-center text-xs text-gray-400">
                <span>Need a team account? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('player-signup')}
                  className="text-flame-400 hover:underline font-bold"
                >
                  Register Profile & Squad
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. PLAYER REGISTRATION FORM */}
        {authMode === 'player-signup' && (
          <div className="space-y-4">
            {/* Quick Google Sign Up Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-panther-950 hover:bg-panther-800 text-white border border-panther-700 py-2.5 px-4 rounded font-rajdhani font-bold text-sm uppercase tracking-wide transition-all shadow-sm hover:border-flame-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Instant Sign-Up with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-panther-800" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">or register squad profile</span>
              <div className="flex-1 h-px bg-panther-800" />
            </div>

            <form onSubmit={handlePlayerSignUp} className="space-y-3">
              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white font-rajdhani font-bold focus:outline-none focus:border-flame-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-flame-500"
                  />
                </div>
              </div>

              {/* Captain IGN & Free Fire UID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Captain IGN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PNTR Sukuna"
                    value={newIgn}
                    onChange={(e) => setNewIgn(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white font-rajdhani font-bold focus:outline-none focus:border-flame-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Free Fire UID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="9-12 numeric digits"
                    maxLength={12}
                    value={newUid}
                    onChange={(e) => setNewUid(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-amber-gold font-mono font-bold focus:outline-none focus:border-flame-500"
                  />
                </div>
              </div>

              {/* WhatsApp Phone */}
              <div>
                <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                  WhatsApp Phone Number * (Room ID / Password SMS & WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded pl-8 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-flame-500"
                  />
                </div>
              </div>

              {/* Team Name & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Clan / Squad Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Total Gaming Tigers"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white font-rajdhani font-semibold focus:outline-none focus:border-flame-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                    Tag
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="TGT"
                    value={newTeamTag}
                    onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                    className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-xs text-white font-orbitron uppercase focus:outline-none focus:border-flame-500"
                  />
                </div>
              </div>

              {/* Squad / Team Image Selector & File Upload */}
              <div className="bg-panther-950/80 border border-panther-700/80 p-3 rounded clip-hud-sm space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-flame-400" />
                    <span>Squad / Team Emblem Image</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">PNG / JPG / WEBP</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Preview Container */}
                  <div className="w-14 h-14 rounded-lg bg-panther-900 border-2 border-flame-500/60 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-flame-sm relative">
                    {teamImage ? (
                      <img
                        src={teamImage}
                        alt="Team Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <Shield className="w-7 h-7 text-flame-400" />
                    )}
                  </div>

                  {/* Actions: Upload & Presets */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-flame-500/20 hover:bg-flame-500/30 text-flame-400 border border-flame-500/40 text-xs font-rajdhani font-bold uppercase transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Team Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {teamImage && (
                        <button
                          type="button"
                          onClick={() => setTeamImage('')}
                          className="text-[11px] text-gray-400 hover:text-red-400 font-rajdhani font-semibold transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-500 font-mono">Or preset:</span>
                      {PRESET_TEAM_LOGOS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setTeamImage(preset.svg)}
                          title={preset.name}
                          className={`w-7 h-7 rounded border p-0.5 transition-transform hover:scale-110 ${
                            teamImage === preset.svg
                              ? 'border-flame-500 bg-flame-500/30 ring-1 ring-flame-400'
                              : 'border-panther-700 bg-panther-900'
                          }`}
                        >
                          <img src={preset.svg} alt={preset.name} className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center mt-2"
                disabled={loading}
                icon={loading ? Loader2 : Flame}
              >
                {loading ? 'Registering...' : 'Create Athlete Profile & Squad'}
              </Button>
            </form>
          </div>
        )}

        {/* 3. STAFF ADMIN PASSKEY LOGIN */}
        {authMode === 'admin-login' && (
          <div className="space-y-4">
            {/* Quick 1-Click Access Button */}
            <button
              type="button"
              onClick={() => {
                loginAsAdmin('sukuna@rusher');
                setSuccess('Staff Authorization Verified! Opening Admin Console...');
                setTimeout(() => {
                  onLoginSuccess?.('admin');
                  onNavigate?.('admin');
                }, 400);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-flame-600 to-amber-gold hover:opacity-95 text-white font-orbitron font-bold text-xs py-3 px-4 rounded shadow-lg shadow-red-900/40 uppercase tracking-wider transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>⚡ 1-Click Instant Staff Access</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-panther-800" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">or verify passkey</span>
              <div className="flex-1 h-px bg-panther-800" />
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                  Referee / Admin Authorization Key *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter staff security key"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-panther-950 border border-panther-700 rounded pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  Tournament referee key: <span className="text-gray-400">sukuna@rusher</span>
                </p>
              </div>

              <Button type="submit" variant="danger" className="w-full justify-center" icon={Shield}>
                Authenticate & Open Admin Console
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-panther-900 border border-panther-700 rounded clip-hud p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-flame-500" />
                <h3 className="font-orbitron font-bold text-white text-base">Reset Account Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetMessage('');
                  setResetError('');
                }}
                className="text-gray-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 mb-4">
              Enter your registered email address. Firebase will dispatch a secure password reset link to your inbox.
            </p>

            {resetError && (
              <div className="bg-red-950/80 border border-red-500 p-2.5 rounded text-xs text-red-300 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{resetError}</span>
              </div>
            )}

            {resetMessage && (
              <div className="bg-emerald-950/80 border border-emerald-500 p-2.5 rounded text-xs text-emerald-300 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{resetMessage}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="block text-xs font-rajdhani font-bold text-gray-300 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="athlete@domain.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-panther-950 border border-panther-700 rounded px-3 py-2 text-sm text-white font-rajdhani focus:outline-none focus:border-flame-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForgotModal(false)}
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isResetting}
                  icon={isResetting ? Loader2 : Mail}
                >
                  {isResetting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
