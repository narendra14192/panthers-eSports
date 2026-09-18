/**
 * Panthers Esports — Firebase Firestore Backend
 * Centralized real-time database layer for all app data.
 *
 * Collections:
 *  - tournaments
 *  - slots
 *  - teams
 *  - leaderboard
 *  - matches
 *  - admin_logs
 *  - tournament_registrations (already used by firebaseRegistration.js)
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { INITIAL_TOURNAMENTS, INITIAL_TEAMS, generateInitialSlots, INITIAL_LEADERBOARD, INITIAL_ADMIN_LOGS } from './seedData';

// ─── Collection Names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  TOURNAMENTS:     'tournaments',
  SLOTS:           'slots',
  TEAMS:           'teams',
  LEADERBOARD:     'leaderboard',
  MATCHES:         'matches',
  ADMIN_LOGS:      'admin_logs',
  REGISTRATIONS:   'tournament_registrations',
};

// ─── Local Storage Cache Keys (offline fallback) ──────────────────────────────
const CACHE = {
  TOURNAMENTS: 'panthers_fb_tournaments',
  SLOTS:       'panthers_fb_slots',
  TEAMS:       'panthers_fb_teams',
  LEADERBOARD: 'panthers_fb_leaderboard',
  MATCHES:     'panthers_fb_matches',
  ADMIN_LOGS:  'panthers_fb_admin_logs',
  SEEDED:      'panthers_fb_seeded_v1',
};

// ─── Cache Helpers ─────────────────────────────────────────────────────────────
export function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function writeCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ }
}

// ─── Serialization Helpers ────────────────────────────────────────────────────
/** Strip undefined values (Firestore rejects them) */
function clean(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => v === undefined ? null : v));
}

// ─── Seed Check & Initial Data Load ──────────────────────────────────────────
/**
 * Check if Firestore has been seeded. If not, seed all collections with initial data.
 * This runs once on first launch.
 */
export async function seedFirestoreIfEmpty() {
  if (!db) return;

  // Use a dedicated sentinel document to check if seeding has happened
  const seedDocRef = doc(db, '_meta', 'seeded');
  try {
    const seedSnap = await getDoc(seedDocRef);
    if (seedSnap.exists()) return; // Already seeded
  } catch (err) {
    console.warn('[Firestore] Seed check failed (likely offline):', err.message);
    return;
  }

  console.log('[Firestore] First run — seeding initial data...');
  const batch = writeBatch(db);

  // Seed tournaments
  for (const t of INITIAL_TOURNAMENTS) {
    batch.set(doc(db, COLLECTIONS.TOURNAMENTS, t.id), clean({
      ...t,
      server_timestamp: serverTimestamp(),
    }));
  }

  // Seed slots
  const initialSlots = generateInitialSlots();
  for (const s of initialSlots) {
    batch.set(doc(db, COLLECTIONS.SLOTS, s.id), clean({
      ...s,
      server_timestamp: serverTimestamp(),
    }));
  }

  // Seed teams
  for (const team of INITIAL_TEAMS) {
    batch.set(doc(db, COLLECTIONS.TEAMS, team.id), clean({
      ...team,
      server_timestamp: serverTimestamp(),
    }));
  }

  // Seed leaderboard
  for (const lb of INITIAL_LEADERBOARD) {
    batch.set(doc(db, COLLECTIONS.LEADERBOARD, lb.id), clean({
      ...lb,
      server_timestamp: serverTimestamp(),
    }));
  }

  // Seed admin logs
  for (const log of INITIAL_ADMIN_LOGS) {
    batch.set(doc(db, COLLECTIONS.ADMIN_LOGS, log.id), clean({
      ...log,
      server_timestamp: serverTimestamp(),
    }));
  }

  // Mark as seeded
  batch.set(seedDocRef, { seeded_at: serverTimestamp(), version: 'v1' });

  try {
    await batch.commit();
    console.log('[Firestore] ✅ Initial data seeded successfully.');
    writeCache(CACHE.SEEDED, true);
  } catch (err) {
    console.warn('[Firestore] Seed commit failed (offline fallback active):', err.message);
  }
}

// ─── Real-Time Subscription Helpers ──────────────────────────────────────────

/**
 * Subscribe to a Firestore collection with real-time updates.
 * Calls onData(array) immediately with cached data, then on every change.
 * Returns unsubscribe function.
 */
export function subscribeToCollection(collectionName, cacheKey, onData, queryConstraints = []) {
  // Emit cached data immediately for instant UI
  const cached = readCache(cacheKey);
  if (cached && cached.length > 0) {
    onData(cached);
  }

  if (!db) return () => {};

  try {
    const q = queryConstraints.length > 0
      ? query(collection(db, collectionName), ...queryConstraints)
      : collection(db, collectionName);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Convert Firestore Timestamps to ISO strings for compatibility
          const cleaned = {};
          for (const [k, v] of Object.entries(data)) {
            cleaned[k] = v instanceof Timestamp ? v.toDate().toISOString() : v;
          }
          docs.push({ ...cleaned, id: docSnap.id });
        });
        writeCache(cacheKey, docs);
        onData(docs);
      },
      (error) => {
        console.warn(`[Firestore] ${collectionName} listener error (using cache):`, error.message);
        const fallback = readCache(cacheKey);
        if (fallback) onData(fallback);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn(`[Firestore] Could not subscribe to ${collectionName}:`, err.message);
    return () => {};
  }
}

// ─── TOURNAMENT CRUD ──────────────────────────────────────────────────────────

export async function saveTournament(tournament) {
  const data = clean({ ...tournament, updated_at: new Date().toISOString(), server_timestamp: serverTimestamp() });
  try {
    if (db) await setDoc(doc(db, COLLECTIONS.TOURNAMENTS, tournament.id), data, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveTournament error:', err.message);
  }
}

export async function deleteTournamentFromDB(tournamentId) {
  try {
    if (db) await deleteDoc(doc(db, COLLECTIONS.TOURNAMENTS, tournamentId));
  } catch (err) {
    console.warn('[Firestore] deleteTournament error:', err.message);
  }
}

// ─── SLOT CRUD ────────────────────────────────────────────────────────────────

export async function saveSlot(slot) {
  const data = clean({ ...slot, updated_at: new Date().toISOString(), server_timestamp: serverTimestamp() });
  try {
    if (db) await setDoc(doc(db, COLLECTIONS.SLOTS, slot.id), data, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveSlot error:', err.message);
  }
}

export async function saveSlotsInBatch(slotsArray) {
  if (!db || !slotsArray.length) return;
  try {
    const batch = writeBatch(db);
    for (const slot of slotsArray) {
      const data = clean({ ...slot, updated_at: new Date().toISOString(), server_timestamp: serverTimestamp() });
      batch.set(doc(db, COLLECTIONS.SLOTS, slot.id), data, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.warn('[Firestore] saveSlotsInBatch error:', err.message);
  }
}

// ─── TEAM CRUD ────────────────────────────────────────────────────────────────

export async function saveTeam(team) {
  const data = clean({ ...team, updated_at: new Date().toISOString(), server_timestamp: serverTimestamp() });
  try {
    if (db) await setDoc(doc(db, COLLECTIONS.TEAMS, team.id), data, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveTeam error:', err.message);
  }
}

// ─── LEADERBOARD CRUD ────────────────────────────────────────────────────────

export async function saveLeaderboardEntry(entry) {
  const data = clean({ ...entry, updated_at: new Date().toISOString(), server_timestamp: serverTimestamp() });
  try {
    if (db) await setDoc(doc(db, COLLECTIONS.LEADERBOARD, entry.id), data, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveLeaderboardEntry error:', err.message);
  }
}

export async function saveLeaderboardBatch(entries) {
  if (!db || !entries.length) return;
  try {
    const batch = writeBatch(db);
    for (const entry of entries) {
      const data = clean({ ...entry, updated_at: new Date().toISOString(), server_timestamp: serverTimestamp() });
      batch.set(doc(db, COLLECTIONS.LEADERBOARD, entry.id), data, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.warn('[Firestore] saveLeaderboardBatch error:', err.message);
  }
}

// ─── MATCH CRUD ───────────────────────────────────────────────────────────────

export async function saveMatch(match) {
  const data = clean({ ...match, server_timestamp: serverTimestamp() });
  try {
    if (db) await setDoc(doc(db, COLLECTIONS.MATCHES, match.id), data, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveMatch error:', err.message);
  }
}

// ─── ADMIN LOG CRUD ───────────────────────────────────────────────────────────

export async function saveAdminLog(log) {
  const data = clean({ ...log, server_timestamp: serverTimestamp() });
  try {
    if (db) await setDoc(doc(db, COLLECTIONS.ADMIN_LOGS, log.id), data, { merge: true });
  } catch (err) {
    console.warn('[Firestore] saveAdminLog error:', err.message);
  }
}

// ─── Cache Keys Export ────────────────────────────────────────────────────────
export { CACHE };
