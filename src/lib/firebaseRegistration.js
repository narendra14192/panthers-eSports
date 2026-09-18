import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'tournament_registrations';
const LOCAL_STORAGE_KEY = 'panthers_firebase_registrations';

// BroadcastChannel for instant local cross-tab sync
const regBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('panthers_registrations_channel')
  : null;

/**
 * Reads local cached registrations
 */
export function getLocalRegistrations() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed reading local registrations cache:', err);
    return [];
  }
}

/**
 * Saves to local cache and broadcasts to other tabs
 */
function setLocalRegistrations(regs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(regs));
    if (regBroadcast) {
      regBroadcast.postMessage({ type: 'REGISTRATIONS_UPDATED', data: regs });
    }
  } catch (err) {
    console.warn('Failed saving local registrations cache:', err);
  }
}

/**
 * Save new tournament registration with 12-digit UPI UTR number to Firebase Firestore
 */
export async function saveRegistrationToFirebase(data) {
  const regId = data.id || `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  
  const registrationRecord = {
    id: regId,
    tournament_id: data.tournament_id || 'tourney-tri-map',
    tournament_name: data.tournament_name || 'Panthers Free Fire Tri-Map Series',
    slot_number: data.slot_number,
    team_id: data.team_id || `team-${Date.now()}`,
    team_name: data.team_name,
    team_tag: data.team_tag,
    captain_user_id: data.captain_user_id || null,
    captain_name: data.captain_name,
    captain_phone: data.captain_phone,
    captain_uid: data.captain_uid,
    players: data.players || [],
    payment: {
      utr: (data.payment?.utr || data.utr || '').trim(),
      amount: data.payment?.amount || 50,
      method: 'UPI',
      status: 'pending_verification', // 'pending_verification' | 'accepted' | 'rejected'
      submitted_at: new Date().toISOString()
    },
    status: 'pending', // 'pending' | 'accepted' | 'rejected'
    admin_notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 1. Update local cache immediately
  const localList = getLocalRegistrations();
  const existingIdx = localList.findIndex(r => r.id === regId);
  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...localList];
    updatedList[existingIdx] = registrationRecord;
  } else {
    updatedList = [registrationRecord, ...localList];
  }
  setLocalRegistrations(updatedList);

  // 2. Persist to Firebase Firestore
  try {
    if (db) {
      const docRef = doc(db, COLLECTION_NAME, regId);
      await setDoc(docRef, {
        ...registrationRecord,
        server_timestamp: serverTimestamp()
      }, { merge: true });
      console.log('✅ Registration saved to Firebase Firestore:', regId);
    }
  } catch (firebaseErr) {
    console.warn('⚠️ Firestore write note (offline or rules restricted, local fallback used):', firebaseErr.message);
  }

  return { success: true, id: regId, registration: registrationRecord };
}

/**
 * Subscribe to real-time registrations from Firebase Firestore
 * Calls callback with updated array of registrations whenever a change occurs
 */
export function subscribeToRegistrations(onUpdate) {
  let unsubscribeFirestore = null;

  // Emit current local cache immediately
  const initialCache = getLocalRegistrations();
  onUpdate(initialCache);

  // 1. Listen to Firebase Firestore changes
  try {
    if (db) {
      const q = query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'));
      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          const remoteList = [];
          snapshot.forEach((docSnap) => {
            remoteList.push({ id: docSnap.id, ...docSnap.data() });
          });

          if (remoteList.length > 0) {
            // Merge with local list to preserve any offline items
            const local = getLocalRegistrations();
            const mergedMap = new Map();
            local.forEach(item => mergedMap.set(item.id, item));
            remoteList.forEach(item => mergedMap.set(item.id, item));
            const merged = Array.from(mergedMap.values()).sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );
            setLocalRegistrations(merged);
            onUpdate(merged);
          }
        },
        (error) => {
          console.warn('⚠️ Firestore snapshot notice (using local mirror):', error.message);
        }
      );
    }
  } catch (err) {
    console.warn('⚠️ Firestore subscription initialized with local mirror:', err.message);
  }

  // 2. Listen to cross-tab BroadcastChannel
  const handleBroadcast = (event) => {
    if (event.data?.type === 'REGISTRATIONS_UPDATED' && event.data?.data) {
      onUpdate(event.data.data);
    }
  };

  if (regBroadcast) {
    regBroadcast.addEventListener('message', handleBroadcast);
  }

  // Return unsubscribe cleanup function
  return () => {
    if (unsubscribeFirestore) unsubscribeFirestore();
    if (regBroadcast) {
      regBroadcast.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * Update registration status (e.g. 'accepted' or 'rejected') in Firebase and local cache
 */
export async function updateRegistrationStatusInFirebase(id, status, notes = '', adminName = 'Admin') {
  const localList = getLocalRegistrations();
  const updatedList = localList.map(r => {
    if (r.id === id) {
      return {
        ...r,
        status,
        payment: {
          ...r.payment,
          status: status === 'accepted' ? 'verified' : 'rejected'
        },
        admin_notes: notes,
        reviewed_by: adminName,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    return r;
  });

  setLocalRegistrations(updatedList);

  try {
    if (db) {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        status,
        'payment.status': status === 'accepted' ? 'verified' : 'rejected',
        admin_notes: notes,
        reviewed_by: adminName,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        server_timestamp: serverTimestamp()
      });
      console.log(`✅ Registration ${id} updated to ${status} in Firebase`);
    }
  } catch (err) {
    console.warn(`⚠️ Firestore update notice for ${id}:`, err.message);
  }

  return { success: true };
}
