/**
 * Official Free Fire Esports Scoring System
 * Placement Points Table (Standard BR 12 Squads):
 * 1st: 12
 * 2nd: 9
 * 3rd: 8
 * 4th: 7
 * 5th: 6
 * 6th: 5
 * 7th: 4
 * 8th: 3
 * 9th: 2
 * 10th: 1
 * 11th: 0
 * 12th: 0
 *
 * Kill Points: 1 point per kill
 */

export const FREE_FIRE_PLACEMENT_POINTS = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
  11: 0,
  12: 0,
};

export const calculateMatchScore = (placement, kills = 0) => {
  const p = parseInt(placement, 10);
  const k = Math.max(0, parseInt(kills, 10) || 0);
  const placementPoints = FREE_FIRE_PLACEMENT_POINTS[p] ?? 0;
  const killPoints = k * 1;
  const totalPoints = placementPoints + killPoints;

  return {
    placement: p,
    placementPoints,
    kills: k,
    killPoints,
    totalPoints,
    isBooyah: p === 1,
  };
};

/**
 * Sorts teams by Free Fire tournament criteria:
 * 1. Points (descending)
 * 2. Wins / Booyahs (descending)
 * 3. Kills (descending)
 * 4. Matches played (ascending)
 */
export const sortLeaderboard = (teams = []) => {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.kills !== a.kills) return b.kills - a.kills;
    return (a.matches_played || 0) - (b.matches_played || 0);
  });
};

/**
 * Format currency for prize pools
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};
