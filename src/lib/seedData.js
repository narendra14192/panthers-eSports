export const INITIAL_TOURNAMENTS = [
  {
    id: 'tourney-panthers-tri-map',
    name: 'Panthers Tri-Map Championship — 3 Matches Back-to-Back',
    description: 'The ultimate Free Fire competitive test! 12 slots battling across Bermuda, Purgatory, and Kalahari in back-to-back matches. Strict Esports Rules Only.',
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    mode: 'Squad / Duo',
    map: 'Bermuda, Purgatory & Kalahari',
    maps: ['Bermuda', 'Purgatory', 'Kalahari'],
    schedule: [
      { match: 1, map: 'Bermuda', time: '19:00 IST', description: 'Opening Drop' },
      { match: 2, map: 'Purgatory', time: '19:45 IST', description: 'Mid-Series Skirmish' },
      { match: 3, map: 'Kalahari', time: '20:30 IST', description: 'Desert Finale' }
    ],
    date: '2026-09-22',
    time: '19:00',
    entry_fee: 50,
    prize_pool: 400,
    prize_distribution: {
      '1st': '₹200 (Winner)',
      '2nd': '₹130 (Runner Up)',
      '3rd': '₹70 (3rd Place)'
    },
    total_slots: 12,
    status: 'upcoming',
    room_id: '8821941',
    room_password: 'PANTHERS_ESPORTS',
    rules: `1. ESPORTS RULES ONLY — Gun skin attributes are strictly OFF (Default weapon stats only).
2. NO EMULATORS / IPADS — Mobile phone devices only. Emulators, PCs, and tablets are strictly banned.
3. 3 MATCHES BACK-TO-BACK — All 12 teams will play:
   • Match 1: Bermuda
   • Match 2: Purgatory
   • Match 3: Kalahari
4. OFFICIAL FREE FIRE SCORING:
   • 1st: 12 pts | 2nd: 9 pts | 3rd: 8 pts | 4th: 7 pts | 5th: 6 pts
   • 6th: 5 pts | 7th: 4 pts | 8th: 3 pts | 9th: 2 pts | 10th: 1 pt
   • 11th–12th: 0 pts
   • Kill Points: 1 point per kill across all 3 matches.
5. MANDATORY POV RECORDING — Captain or rusher must screen record the match.
6. ANTI-CHEAT & ANTI-TEAMING — Zero tolerance. Immediate disqualification without refund.
7. Custom room credentials will be shared 15 minutes before Match 1 start.`,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_TEAMS = [
  {
    id: 'team-1',
    name: 'Panther Elites',
    tag: 'PNTR',
    captain_user_id: 'user-player-1',
    captain_name: 'Aman "Shadow" Verma',
    captain_phone: '+91 98765 43210',
    captain_uid: '182947192',
    players: [
      { name: 'PNTR Shadow', uid: '182947192', role: 'Captain / Rusher' },
      { name: 'PNTR Venom', uid: '293847102', role: 'Sniper' },
      { name: 'PNTR Blaze', uid: '482910394', role: 'Flanker' },
      { name: 'PNTR Ghost', uid: '958271039', role: 'Support' }
    ]
  },
  {
    id: 'team-2',
    name: 'Viper Strike Esports',
    tag: 'VPR',
    captain_user_id: 'user-player-2',
    captain_name: 'Rohan "Viper" Das',
    captain_phone: '+91 98111 22233',
    captain_uid: '381940182',
    players: [
      { name: 'VPR Viper', uid: '381940182', role: 'Captain' },
      { name: 'VPR Toxic', uid: '849201948', role: 'Rusher' },
      { name: 'VPR Cobra', uid: '748291048', role: 'Support' },
      { name: 'VPR Acid', uid: '638201948', role: 'Sniper' }
    ]
  },
  {
    id: 'team-3',
    name: 'Soul Reapers',
    tag: 'SOUL',
    captain_user_id: 'user-player-3',
    captain_name: 'Karan "Death" Singh',
    captain_phone: '+91 98450 67890',
    captain_uid: '492819384',
    players: [
      { name: 'SOUL Reaper', uid: '492819384', role: 'Captain' },
      { name: 'SOUL Fang', uid: '192837465', role: 'Rusher' },
      { name: 'SOUL Void', uid: '928374651', role: 'Sniper' },
      { name: 'SOUL Skull', uid: '837465192', role: 'Support' }
    ]
  },
  {
    id: 'team-4',
    name: 'Phoenix Dawn',
    tag: 'PHX',
    captain_user_id: 'user-player-4',
    captain_name: 'Priya "Ember" Sharma',
    captain_phone: '+91 97654 32109',
    captain_uid: '592819201',
    players: [
      { name: 'PHX Ember', uid: '592819201', role: 'Captain' },
      { name: 'PHX Ashes', uid: '837261940', role: 'Rusher' },
      { name: 'PHX Spark', uid: '284719302', role: 'Flanker' },
      { name: 'PHX Inferno', uid: '194820394', role: 'Sniper' }
    ]
  },
  {
    id: 'team-5',
    name: 'Titan Force',
    tag: 'TTN',
    captain_user_id: 'user-player-5',
    captain_name: 'Vikram "Goliath" Roy',
    captain_phone: '+91 99223 34455',
    captain_uid: '748291039',
    players: [
      { name: 'TTN Titan', uid: '748291039', role: 'Captain' },
      { name: 'TTN Colossus', uid: '482910293', role: 'Rusher' },
      { name: 'TTN Atlas', uid: '928301928', role: 'Support' },
      { name: 'TTN Kronos', uid: '573829102', role: 'Sniper' }
    ]
  },
  {
    id: 'team-6',
    name: 'Shadow Killers',
    tag: 'SHDW',
    captain_user_id: 'user-player-6',
    captain_name: 'Aditya "Ninja" Joshi',
    captain_phone: '+91 99887 76655',
    captain_uid: '648291028',
    players: [
      { name: 'SHDW Ninja', uid: '648291028', role: 'Captain' },
      { name: 'SHDW Blade', uid: '847291029', role: 'Rusher' },
      { name: 'SHDW Mist', uid: '749201938', role: 'Support' },
      { name: 'SHDW Echo', uid: '394810293', role: 'Sniper' }
    ]
  }
];

export const generateInitialSlots = () => {
  const slots = [];
  const tourneyId = 'tourney-panthers-tri-map';

  // 12 slots total for the Panthers Tri-Map Championship
  for (let i = 1; i <= 12; i++) {
    if (i === 1) {
      slots.push({
        id: `slot-${tourneyId}-1`,
        tournament_id: tourneyId,
        slot_number: 1,
        team_id: 'team-1',
        status: 'checked_in',
        booked_at: new Date(Date.now() - 3600000 * 20).toISOString()
      });
    } else if (i === 2) {
      slots.push({
        id: `slot-${tourneyId}-2`,
        tournament_id: tourneyId,
        slot_number: 2,
        team_id: 'team-2',
        status: 'checked_in',
        booked_at: new Date(Date.now() - 3600000 * 18).toISOString()
      });
    } else if (i === 3) {
      slots.push({
        id: `slot-${tourneyId}-3`,
        tournament_id: tourneyId,
        slot_number: 3,
        team_id: 'team-3',
        status: 'booked',
        booked_at: new Date(Date.now() - 3600000 * 12).toISOString()
      });
    } else if (i === 4) {
      slots.push({
        id: `slot-${tourneyId}-4`,
        tournament_id: tourneyId,
        slot_number: 4,
        team_id: 'team-4',
        status: 'booked',
        booked_at: new Date(Date.now() - 3600000 * 8).toISOString()
      });
    } else if (i === 5) {
      slots.push({
        id: `slot-${tourneyId}-5`,
        tournament_id: tourneyId,
        slot_number: 5,
        team_id: 'team-5',
        status: 'booked',
        booked_at: new Date(Date.now() - 3600000 * 4).toISOString()
      });
    } else if (i === 6) {
      slots.push({
        id: `slot-${tourneyId}-6`,
        tournament_id: tourneyId,
        slot_number: 6,
        team_id: 'team-6',
        status: 'booked',
        booked_at: new Date(Date.now() - 3600000 * 2).toISOString()
      });
    } else {
      // Slots 7 to 12 are wide OPEN for players to book!
      slots.push({
        id: `slot-${tourneyId}-${i}`,
        tournament_id: tourneyId,
        slot_number: i,
        team_id: null,
        status: 'open',
        booked_at: null
      });
    }
  }

  return slots;
};

export const INITIAL_LEADERBOARD = [
  {
    id: 'lb-1',
    tournament_id: 'tourney-panthers-tri-map',
    team_id: 'team-1',
    team_name: 'Panther Elites',
    team_tag: 'PNTR',
    points: 44,
    kills: 20,
    wins: 2,
    matches_played: 3
  },
  {
    id: 'lb-2',
    tournament_id: 'tourney-panthers-tri-map',
    team_id: 'team-2',
    team_name: 'Viper Strike Esports',
    team_tag: 'VPR',
    points: 36,
    kills: 18,
    wins: 1,
    matches_played: 3
  },
  {
    id: 'lb-3',
    tournament_id: 'tourney-panthers-tri-map',
    team_id: 'team-3',
    team_name: 'Soul Reapers',
    team_tag: 'SOUL',
    points: 31,
    kills: 15,
    wins: 0,
    matches_played: 3
  },
  {
    id: 'lb-4',
    tournament_id: 'tourney-panthers-tri-map',
    team_id: 'team-4',
    team_name: 'Phoenix Dawn',
    team_tag: 'PHX',
    points: 25,
    kills: 11,
    wins: 0,
    matches_played: 3
  },
  {
    id: 'lb-5',
    tournament_id: 'tourney-panthers-tri-map',
    team_id: 'team-5',
    team_name: 'Titan Force',
    team_tag: 'TTN',
    points: 21,
    kills: 9,
    wins: 0,
    matches_played: 3
  },
  {
    id: 'lb-6',
    tournament_id: 'tourney-panthers-tri-map',
    team_id: 'team-6',
    team_name: 'Shadow Killers',
    team_tag: 'SHDW',
    points: 17,
    kills: 8,
    wins: 0,
    matches_played: 3
  },

  // Global Season Totals
  {
    id: 'glb-1',
    tournament_id: null,
    team_id: 'team-1',
    team_name: 'Panther Elites',
    team_tag: 'PNTR',
    points: 44,
    kills: 20,
    wins: 2,
    matches_played: 3
  },
  {
    id: 'glb-2',
    tournament_id: null,
    team_id: 'team-2',
    team_name: 'Viper Strike Esports',
    team_tag: 'VPR',
    points: 36,
    kills: 18,
    wins: 1,
    matches_played: 3
  },
  {
    id: 'glb-3',
    tournament_id: null,
    team_id: 'team-3',
    team_name: 'Soul Reapers',
    team_tag: 'SOUL',
    points: 31,
    kills: 15,
    wins: 0,
    matches_played: 3
  }
];

export const INITIAL_ADMIN_LOGS = [
  {
    id: 'log-1',
    admin_name: 'PantherAdmin',
    action: 'TOURNAMENT_CREATED',
    details: 'Created single tournament "Panthers Tri-Map Championship — 3 Matches Back-to-Back" with 12 slots (₹50/slot, Prize: ₹400).',
    timestamp: new Date().toISOString()
  },
  {
    id: 'log-2',
    admin_name: 'PantherAdmin',
    action: 'SLOT_CHECKED_IN',
    details: 'Verified lobby check-in for Slot #1 [PNTR] Panther Elites.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];
