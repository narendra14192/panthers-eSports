import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

const AuthContext = createContext(null);

const STORAGE_KEY_SESSION = 'panthers_auth_session_v3';
const PROFILE_KEY_PREFIX = 'panthers_gamer_profile_';

export const DEFAULT_PLAYER = {
  id: 'user-player-1',
  email: 'shadow.verma@panthers.gg',
  phone: '+91 98765 43210',
  in_game_name: 'PNTR Shadow',
  free_fire_uid: '182947192',
  role: 'player', // 'player' or 'admin'
  avatar: null,
  team_image: null,
  team_id: 'team-1',
  team_name: 'Panther Elites',
  team_tag: 'PNTR'
};

export const DEFAULT_ADMIN = {
  id: 'user-admin-1',
  email: 'admin@panthers.esports',
  phone: '+91 98999 11223',
  in_game_name: 'Panther Overseer [Staff]',
  free_fire_uid: '8688693905',
  role: 'admin',
  avatar: null,
  team_image: null,
  team_id: null
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to load or create extended gamer profile for a Firebase user
  const loadGamerProfile = (fbUser, customProfile = null) => {
    if (!fbUser) return null;
    const uid = fbUser.uid;
    const storageKey = `${PROFILE_KEY_PREFIX}${uid}`;
    let saved = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch (e) {
      console.error('Error reading gamer profile:', e);
    }

    // Clean up broken external unsplash images from legacy cached state
    const cleanSavedAvatar = (saved?.avatar && !saved.avatar.includes('images.unsplash.com')) ? saved.avatar : null;
    const cleanSavedTeamImage = (saved?.team_image && !saved.team_image.includes('images.unsplash.com')) ? saved.team_image : null;

    const defaultIgn = fbUser.displayName || fbUser.email?.split('@')[0] || 'Panther Athlete';
    const effectiveTeamImage = customProfile?.team_image || cleanSavedTeamImage || customProfile?.avatar || cleanSavedAvatar || null;

    const merged = {
      id: uid,
      email: fbUser.email || '',
      phone: fbUser.phoneNumber || saved?.phone || '+91 98765 43210',
      in_game_name: customProfile?.in_game_name || saved?.in_game_name || defaultIgn,
      free_fire_uid: customProfile?.free_fire_uid || saved?.free_fire_uid || '182947192',
      role: customProfile?.role || saved?.role || 'player',
      team_image: effectiveTeamImage,
      avatar: effectiveTeamImage || (fbUser.photoURL && !fbUser.photoURL.includes('unsplash') ? fbUser.photoURL : null),
      team_id: customProfile?.team_id || saved?.team_id || `team-${uid.slice(0, 8)}`,
      team_name: customProfile?.team_name || saved?.team_name || `${defaultIgn}'s Squad`,
      team_tag: customProfile?.team_tag || saved?.team_tag || 'PNTR',
      provider: fbUser.providerData?.[0]?.providerId || 'password',
      ...customProfile
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch (e) {
      console.error('Error saving gamer profile:', e);
    }

    return merged;
  };

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const gamerProfile = loadGamerProfile(fbUser);
        setUser(gamerProfile);
      } else {
        // If not logged in via Firebase, check if local/demo session is active
        try {
          const localSession = localStorage.getItem(STORAGE_KEY_SESSION);
          if (localSession) {
            const parsed = JSON.parse(localSession);
            // Clean up any legacy unsplash URLs
            if (parsed?.avatar && parsed.avatar.includes('images.unsplash.com')) parsed.avatar = null;
            if (parsed?.team_image && parsed.team_image.includes('images.unsplash.com')) parsed.team_image = null;
            setUser(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // ignore
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save current active session for quick recovery
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        if (user.id) {
          localStorage.setItem(`${PROFILE_KEY_PREFIX}${user.id}`, JSON.stringify(user));
        }
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    } catch (e) {
      console.error('Failed saving auth state:', e);
    }
  }, [user]);

  // 1. Firebase Sign In with Email & Password
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = loadGamerProfile(cred.user);
      setUser(profile);
      return { success: true, user: profile };
    } catch (error) {
      return { success: false, error: formatAuthError(error) };
    } finally {
      setLoading(false);
    }
  };

  // 2. Firebase Registration with Email, Password & Player Gamer Profile
  const registerWithEmail = async (email, password, playerData) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase auth display name if IGN provided
      if (playerData.in_game_name) {
        try {
          await updateFirebaseProfile(cred.user, {
            displayName: playerData.in_game_name
          });
        } catch {
          // non-blocking
        }
      }

      const newPlayerProfile = {
        id: cred.user.uid,
        email: email,
        phone: playerData.phone || '+91 99999 88888',
        in_game_name: playerData.in_game_name,
        free_fire_uid: playerData.free_fire_uid,
        role: 'player',
        team_image: playerData.team_image || null,
        avatar: playerData.team_image || null,
        team_id: `team-${Date.now()}`,
        team_name: playerData.team_name || `${playerData.in_game_name}'s Squad`,
        team_tag: playerData.team_tag || 'PNTR'
      };

      const saved = loadGamerProfile(cred.user, newPlayerProfile);
      setUser(saved);
      return { success: true, user: saved };
    } catch (error) {
      return { success: false, error: formatAuthError(error) };
    } finally {
      setLoading(false);
    }
  };

  // 3. Firebase Google Popup Sign-In
  const loginWithGoogle = async (optionalData = {}) => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const profile = loadGamerProfile(cred.user, optionalData);
      setUser(profile);
      return { success: true, user: profile };
    } catch (error) {
      return { success: false, error: formatAuthError(error) };
    } finally {
      setLoading(false);
    }
  };

  // 4. Send Firebase Password Reset Email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: formatAuthError(error) };
    }
  };

  // 5. Staff Admin Passcode Login
  const loginAsAdmin = (passcode = '') => {
    if (passcode === 'sukuna@rusher') {
      setUser(DEFAULT_ADMIN);
      return { success: true, user: DEFAULT_ADMIN };
    }
    return { success: false, error: 'Invalid admin authorization key.' };
  };

  // Fallback demo player login (for demo/offline testing)
  const loginAsPlayer = (customData = {}) => {
    const updated = {
      ...DEFAULT_PLAYER,
      ...customData,
      role: 'player'
    };
    setUser(updated);
    return updated;
  };

  // Fallback demo player registration
  const registerPlayer = (playerData) => {
    const newPlayer = {
      id: `user-p-${Date.now()}`,
      email: playerData.email || `${playerData.in_game_name.toLowerCase().replace(/\s+/g, '')}@player.gg`,
      phone: playerData.phone || '+91 99999 88888',
      in_game_name: playerData.in_game_name,
      free_fire_uid: playerData.free_fire_uid,
      role: 'player',
      team_image: playerData.team_image || null,
      avatar: playerData.team_image || null,
      team_id: `team-${Date.now()}`,
      team_name: playerData.team_name || 'My Free Fire Squad',
      team_tag: playerData.team_tag || 'SQD'
    };
    setUser(newPlayer);
    return newPlayer;
  };

  const switchRole = (targetRole) => {
    if (targetRole === 'admin') {
      setUser(prev => ({ ...(prev || DEFAULT_ADMIN), role: 'admin' }));
    } else {
      setUser(prev => ({ ...(prev || DEFAULT_PLAYER), role: 'player' }));
    }
  };

  const updateProfile = (data) => {
    setUser(prev => {
      const updated = {
        ...(prev || DEFAULT_PLAYER),
        ...data
      };
      if (data.team_image !== undefined) {
        updated.team_image = data.team_image;
        updated.avatar = data.team_image;
      }
      if (updated.id) {
        try {
          localStorage.setItem(`${PROFILE_KEY_PREFIX}${updated.id}`, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed saving profile update:', e);
        }
      }
      return updated;
    });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut notice:', e);
    }
    setUser(null);
    setFirebaseUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } catch {
      // ignore
    }
  };

  const isAdmin = user?.role === 'admin';
  const isPlayer = user?.role === 'player' || (!isAdmin && Boolean(user));
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAdmin,
        isPlayer,
        isAuthenticated,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        loginAsPlayer,
        registerPlayer,
        loginAsAdmin,
        switchRole,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// User-friendly Firebase auth error message translator
function formatAuthError(error) {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please double check your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Try signing in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily restricted due to many failed attempts. Try again later.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
