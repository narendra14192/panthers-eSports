/**
 * Panthers Esports — AI-Powered Chatbot Engine
 * Powered by NVIDIA NIM (llama-3.1-nemotron-ultra-253b)
 * Falls back to rule-based engine if API is unavailable.
 */

// API call goes through our Vercel proxy (/api/chat) to avoid CORS and keep key server-side
const PROXY_URL = '/api/chat';
const AI_ENABLED = !!import.meta.env.VITE_NVIDIA_API_KEY;

// ─── System Prompt Builder ────────────────────────────────────────────────────
function buildSystemPrompt(context = {}) {
  const { tournament, slots = [], leaderboard = [], user } = context;

  const openSlots = slots.filter(s => s.status === 'open').length;
  const bookedSlots = slots.filter(s => s.status !== 'open').length;
  const totalSlots = tournament?.total_slots || 24;

  const leaderboardText = leaderboard.length > 0
    ? leaderboard.slice(0, 5).map((t, i) =>
        `${i + 1}. [${t.team_tag}] ${t.team_name} — ${t.points} pts, ${t.kills} kills`
      ).join('\n')
    : 'No results entered yet.';

  const tournamentInfo = tournament
    ? `
ACTIVE TOURNAMENT:
- Name: ${tournament.name || 'Panthers Tri-Map Championship'}
- Date: ${tournament.date}
- Time: ${tournament.time} IST
- Mode: ${tournament.mode}
- Maps: Bermuda → Purgatory → Kalahari
- Entry Fee: ₹${tournament.entry_fee}/slot
- Prize Pool: ₹${tournament.prize_pool}
- Total Slots: ${totalSlots}
- Open Slots: ${openSlots}
- Booked Slots: ${bookedSlots}
- Room ID: ${tournament.room_id || 'Will be shared 15 min before match'}
- Room Password: ${tournament.room_password || 'Will be shared 15 min before match'}
`
    : 'No active tournament at the moment.';

  const userInfo = user
    ? `CURRENT USER: ${user.displayName || user.email || 'Anonymous player'}`
    : 'User is not logged in.';

  return `You are "Panther Bot" — an enthusiastic, expert AI assistant for Panthers Esports, a competitive Free Fire tournament platform based in India. You are helpful, energetic, and use gaming slang naturally. You use emojis to make responses engaging but keep answers concise and clear.

PLATFORM OVERVIEW:
- Panthers Esports runs competitive Free Fire Tri-Map Championship tournaments
- Players can register teams (squads of 4), book slots, and compete for cash prizes
- The platform has a Player Portal, Tournaments page, Leaderboard, and Admin Portal

${tournamentInfo}

PRIZE BREAKDOWN:
- 🥇 1st Place: ₹200
- 🥈 2nd Place: ₹130
- 🥉 3rd Place: ₹70

MATCH SCHEDULE:
- 19:00 IST — Match 1: Bermuda (Opening Drop)
- 19:45 IST — Match 2: Purgatory (Mid-Series Skirmish)
- 20:30 IST — Match 3: Kalahari (Desert Finale)

OFFICIAL RULES:
- Esports Rules ONLY — Gun skin attributes strictly OFF
- No Emulators/iPads — Mobile phones only
- POV Recording Mandatory for captain/rusher
- Anti-Teaming: Zero tolerance, instant DQ, no refund
- Anti-Cheat: Any hack = permanent ban
- Late joins = missed match, no refund

SCORING SYSTEM:
- Placement Points: 1st=12, 2nd=9, 3rd=8, 4th=7, 5th=6, 6th=5, 7th=4, 8th=3, 9th=2, 10th=1, 11th-24th=0
- Kill Points: 1 point per kill across all 3 matches
- Winner = Highest total across all 3 maps

LIVE LEADERBOARD (Top 5):
${leaderboardText}

${userInfo}

HOW TO BOOK:
1. Go to Tournaments page
2. Click the active tournament
3. Pick an open slot (green)
4. Fill team details + all 4 player UIDs
5. Click "Confirm & Lock Slot"

ADMIN ACCESS: Login → Staff Admin tab → Enter key "PANTHER2026"

IMPORTANT BEHAVIOR:
- Always respond in English
- Keep responses under 200 words unless the user asks for detailed info
- Use markdown formatting (** for bold, • for bullets)
- When unsure about real-time data, say it might not be updated
- Never make up tournament data — use only what's provided above
- If asked something outside your knowledge scope, suggest contacting the admin`;
}

// ─── NVIDIA NIM AI Response (via server proxy) ────────────────────────────────
export async function generateAIResponse(message, context = {}, conversationHistory = []) {
  if (!AI_ENABLED) {
    throw new Error('NVIDIA API key not configured');
  }

  const systemPrompt = buildSystemPrompt(context);

  // Build messages array with conversation history
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-8), // Last 8 messages for context window
    { role: 'user', content: message },
  ];

  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      temperature: 0.6,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Proxy error ${response.status}: ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) throw new Error('Empty response from AI');

  return {
    text,
    quickReplies: extractQuickReplies(message, text),
  };
}

// ─── Smart Quick Reply Extractor ─────────────────────────────────────────────
function extractQuickReplies(userMessage, botResponse) {
  const lower = userMessage.toLowerCase();
  if (lower.includes('slot') || lower.includes('register') || lower.includes('book')) {
    return ['🏆 Prize Pool', '📜 Rules', '💰 Entry Fee'];
  }
  if (lower.includes('prize') || lower.includes('reward') || lower.includes('win')) {
    return ['📊 Scoring System', '🗺️ Maps', '📋 Tournament Info'];
  }
  if (lower.includes('rule') || lower.includes('device') || lower.includes('emulator')) {
    return ['📱 Allowed Devices', '💸 Refund Policy', '🎯 Book a Slot'];
  }
  if (lower.includes('score') || lower.includes('point') || lower.includes('kill')) {
    return ['🏆 Prizes', '🗺️ Maps', '📋 Tournament Info'];
  }
  if (lower.includes('map') || lower.includes('bermuda') || lower.includes('purgatory')) {
    return ['📊 Scoring System', '🏆 Prizes', '📜 Rules'];
  }
  if (lower.includes('time') || lower.includes('schedule') || lower.includes('when')) {
    return ['🔑 Room ID/Password', '📜 Rules', '🎯 Book a Slot'];
  }
  if (lower.includes('leaderboard') || lower.includes('rank') || lower.includes('standing')) {
    return ['📊 Scoring System', '🏆 Prizes', '🗺️ Maps'];
  }
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return ['📋 Tournament Info', '🎯 How to Book', '🏆 Prize Pool', '📜 Rules'];
  }
  return ['📋 Tournament Info', '🎯 Book a Slot', '🏆 Prizes', '📜 Rules'];
}

// ─── Fallback: Rule-Based Engine ─────────────────────────────────────────────
const INTENTS = [
  { id: 'greeting', patterns: ['hi', 'hello', 'hey', 'sup', 'yo', 'hola', 'namaste', 'start'], priority: 10 },
  { id: 'tournament_info', patterns: ['tournament', 'event', 'championship', 'tri-map', 'match', 'series'], priority: 8 },
  { id: 'slot_info', patterns: ['slot', 'available', 'open', 'book', 'booking', 'register', 'join', 'seat', 'how to join'], priority: 9 },
  { id: 'slot_count', patterns: ['how many slots', 'slots left', 'slots remaining', 'empty slots', 'free slots', 'remaining'], priority: 10 },
  { id: 'prize', patterns: ['prize', 'reward', 'money', 'cash', 'winning', 'winner', '1st', '2nd', '3rd', 'first', 'second', 'third', 'payout', 'earn'], priority: 8 },
  { id: 'entry_fee', patterns: ['fee', 'cost', 'price', 'entry', 'pay', 'rupee', 'rs', '₹', 'charge', 'how much'], priority: 8 },
  { id: 'maps', patterns: ['map', 'maps', 'bermuda', 'purgatory', 'kalahari', 'location', 'where', 'which map'], priority: 7 },
  { id: 'schedule', patterns: ['time', 'date', 'schedule', 'when', 'start', 'timing', 'ist', 'match time', 'what time'], priority: 7 },
  { id: 'room_info', patterns: ['room', 'room id', 'password', 'credentials', 'pass', 'custom room', 'lobby', 'access'], priority: 9 },
  { id: 'rules', patterns: ['rule', 'rules', 'regulation', 'cheat', 'hack', 'emulator', 'ipad', 'skin', 'pov', 'record', 'ban', 'disqualify', 'allowed'], priority: 7 },
  { id: 'leaderboard', patterns: ['leaderboard', 'standing', 'rank', 'ranking', 'top', 'score', 'points', 'kills', 'win', 'position'], priority: 7 },
  { id: 'scoring', patterns: ['scoring', 'point system', 'placement points', 'kill point', 'how points', 'how score', 'points per kill', 'booyah'], priority: 8 },
  { id: 'captain', patterns: ['captain', 'igl', 'leader', 'contact', 'whatsapp', 'phone', 'number'], priority: 6 },
  { id: 'team', patterns: ['team', 'squad', 'clan', 'duo', 'partner', 'members', 'roster', 'lineup'], priority: 6 },
  { id: 'refund', patterns: ['refund', 'cancel', 'cancellation', 'money back', 'withdraw', 'quit'], priority: 8 },
  { id: 'help', patterns: ['help', 'guide', 'how', 'what can', 'assist', 'support', 'info', 'tell me', 'explain'], priority: 5 },
  { id: 'admin', patterns: ['admin', 'organizer', 'staff', 'panther', 'host', 'owner'], priority: 6 },
  { id: 'tips', patterns: ['tip', 'tips', 'trick', 'strategy', 'advice', 'pro', 'win tips', 'how to win', 'booyah tips'], priority: 5 },
  { id: 'device', patterns: ['device', 'mobile', 'phone', 'pc', 'computer', 'emulator', 'tablet', 'ipad', 'allowed device'], priority: 7 },
  { id: 'bye', patterns: ['bye', 'goodbye', 'exit', 'thanks', 'thank you', 'thx', 'ok thanks', 'got it', 'done'], priority: 6 },
];

export function detectIntent(message) {
  const lower = message.toLowerCase().trim();
  let bestMatch = { id: 'unknown', score: 0 };
  for (const intent of INTENTS) {
    for (const pattern of intent.patterns) {
      if (lower.includes(pattern)) {
        const score = intent.priority + (pattern.length / 3);
        if (score > bestMatch.score) bestMatch = { id: intent.id, score };
      }
    }
  }
  return bestMatch.id;
}

export function generateResponse(message, context = {}) {
  const { tournament, slots = [], leaderboard = [], user } = context;
  const intent = detectIntent(message);
  const openSlots = slots.filter(s => s.status === 'open').length;
  const totalSlots = tournament?.total_slots || 24;

  switch (intent) {
    case 'greeting':
      return {
        text: `🐆 **Yo! Welcome to Panthers Esports!**\n\nI'm **Panther Bot** — your personal Free Fire tournament assistant!\n\nAsk me about:\n• 🎮 Tournaments & Slots\n• 🏆 Prizes & Leaderboard\n• 📋 Rules & Regulations\n• 🔑 Room credentials\n• 💡 Free Fire tips\n\nWhat do you need, soldier? 🔥`,
        quickReplies: ['📋 Tournament Info', '🎯 Book a Slot', '🏆 Prize Pool', '📜 Rules'],
      };
    case 'tournament_info':
      if (!tournament) return { text: `🎮 No active tournament right now. Check back soon!` };
      return {
        text: `🎮 **Panthers Tri-Map Championship**\n\n📅 **Date:** ${tournament.date}\n⏰ **Time:** ${tournament.time} IST\n🗺️ **Maps:** Bermuda → Purgatory → Kalahari\n👥 **Format:** ${tournament.mode}\n💰 **Entry Fee:** ₹${tournament.entry_fee}/slot\n🏆 **Prize Pool:** ₹${tournament.prize_pool}\n\n**${openSlots} slots still OPEN!** 🔥`,
        quickReplies: ['🎯 How to Register', '🏆 Prizes', '📜 Rules', '🔑 Room ID'],
      };
    case 'slot_info':
      return {
        text: `🎯 **How to Book Your Slot:**\n\n1️⃣ Go to **Tournaments** page\n2️⃣ Click on the active tournament\n3️⃣ Pick an 🟢 open slot\n4️⃣ Fill your **team details + 4 player UIDs**\n5️⃣ Hit **"Confirm & Lock Slot"** ⚡\n\n> **${openSlots} of ${totalSlots} slots OPEN!**`,
        quickReplies: ['💰 Entry Fee', '📋 What Details Needed', '📜 Rules'],
      };
    case 'slot_count':
      const statusText = openSlots === 0
        ? '❌ **All slots are FULL!**'
        : openSlots <= 5
          ? `⚠️ **HURRY! Only ${openSlots} slots left!**`
          : `✅ **${openSlots} of ${totalSlots} slots OPEN**`;
      return {
        text: `🎰 **Slot Status:**\n\n${statusText}\n\n🟢 Open: ${openSlots} | 🟡 Booked: ${slots.filter(s => s.status === 'booked').length}`,
        quickReplies: ['🎯 Book Now', '💰 Entry Fee', '🏆 Prizes'],
      };
    case 'prize':
      return {
        text: `🏆 **Prize Pool: ₹${tournament?.prize_pool || 400}**\n\n🥇 1st: ₹200\n🥈 2nd: ₹130\n🥉 3rd: ₹70\n\nWinners decided by placement + kill points across 3 maps! 🔫`,
        quickReplies: ['📊 Scoring System', '🗺️ Maps', '📜 Rules'],
      };
    case 'entry_fee':
      return {
        text: `💰 **Entry Fee: ₹${tournament?.entry_fee || 50}/slot**\n\nCovers all 3 maps. Payment collected after slot confirmation.\n\n🏆 Prize pool: ₹${tournament?.prize_pool || 400}`,
        quickReplies: ['🎯 Book a Slot', '🏆 Prizes', '🔑 Room Info'],
      };
    case 'maps':
      return {
        text: `🗺️ **3 Maps Back-to-Back:**\n\n🟡 **19:00** — Bermuda\n🔴 **19:45** — Purgatory\n🏜️ **20:30** — Kalahari\n\nAll 24 teams play all 3 maps. Points decide winner! 🏆`,
        quickReplies: ['📊 Scoring System', '🏆 Prizes', '📜 Rules'],
      };
    case 'schedule':
      return {
        text: `⏰ **Match Schedule (${tournament?.date || 'TBD'}):**\n\n🟡 19:00 IST — Bermuda\n🔴 19:45 IST — Purgatory\n🏜️ 20:30 IST — Kalahari\n\n> Join lobby 15 min early!`,
        quickReplies: ['🔑 Room ID/Password', '📜 Rules', '🎯 Book a Slot'],
      };
    case 'room_info':
      return tournament?.room_id
        ? {
            text: `🔑 **Room Credentials:**\n\n**ID:** \`${tournament.room_id}\`\n**Password:** \`${tournament.room_password}\`\n\n> Join 15 min before Match 1 (19:00 IST)`,
            quickReplies: ['⏰ Schedule', '📜 Rules', '🎮 Tournament Info'],
          }
        : {
            text: `🔑 Room ID & password shared **15 min before Match 1** to captain's WhatsApp.\n\n> Verified registered teams only!`,
            quickReplies: ['🎯 Book a Slot', '⏰ Schedule', '📜 Rules'],
          };
    case 'rules':
      return {
        text: `📜 **Official Rules:**\n\n⚔️ Esports rules — Gun skins OFF\n📵 No emulators/iPads — Mobile only!\n📹 POV recording mandatory\n🤝 No teaming — instant DQ\n🚫 No hacks — permanent ban\n⏱️ Late joins = miss match (no refund)`,
        quickReplies: ['📱 Allowed Devices', '💸 Refund Policy', '🔑 Room Info'],
      };
    case 'scoring':
      return {
        text: `📊 **Scoring System:**\n\n**Placement:**\n🥇 1st: 12pts | 🥈 2nd: 9pts | 🥉 3rd: 8pts\n4th: 7 | 5th: 6 | 6th: 5 | 7th: 4 | 8th: 3 | 9th: 2 | 10th: 1\n\n🔫 **Kills:** 1 point each\n\nTotal = placement + kills across all 3 maps 🏆`,
        quickReplies: ['🏆 Prizes', '🗺️ Maps', '📋 Tournament Info'],
      };
    case 'leaderboard':
      if (!leaderboard || leaderboard.length === 0) {
        return {
          text: `📊 **Leaderboard** updates in real-time after each match.\n\nCheck the **Leaderboard tab** for live standings! 🏆`,
          quickReplies: ['📊 Scoring System', '🏆 Prizes', '🎮 Tournament Info'],
        };
      }
      const top3 = leaderboard.slice(0, 3);
      const lbText = top3.map((t, i) => {
        const medals = ['🥇', '🥈', '🥉'];
        return `${medals[i]} **[${t.team_tag}] ${t.team_name}** — ${t.points}pts`;
      }).join('\n');
      return {
        text: `📊 **Top 3 Leaderboard:**\n\n${lbText}\n\nSee full standings on the Leaderboard page! 🔥`,
        quickReplies: ['📊 Scoring System', '🏆 Prizes', '🗺️ Maps'],
      };
    case 'team':
      return {
        text: `👥 **Team Requirements:**\n\n• Squad of 4 players\n• Each player: IGN, Free Fire UID, Role\n• Captain: WhatsApp number + clan name\n• Optional: 5th substitute\n\n🎯 Book your slot now!`,
        quickReplies: ['🎯 Book a Slot', '📋 Tournament Info', '💰 Entry Fee'],
      };
    case 'refund':
      return {
        text: `💸 **Refund Policy:**\n\n❌ No refunds after slot confirmation\n❌ No refunds for DQ\n❌ No refunds for late joins\n\n✅ Only if tournament is cancelled by organizer`,
        quickReplies: ['📜 Rules', '🎯 Book a Slot', '📋 Tournament Info'],
      };
    case 'device':
      return {
        text: `📱 **Allowed Devices:**\n\n✅ Android smartphones\n✅ iPhone / iOS\n\n❌ PC / Emulators (GameLoop, LDPlayer)\n❌ iPad / Tablets\n\nMobile only — keep it fair! 🎮`,
        quickReplies: ['📜 Rules', '🎯 Book a Slot', '📋 Tournament Info'],
      };
    case 'tips':
      const tips = [
        `💡 **DR-L or M82B for Kalahari** — long-range wins the desert!`,
        `💡 **In Bermuda, rotate early** to Clock Tower or Mill — high ground = free kills!`,
        `💡 **Stick together in Purgatory** — solo pushes get you eliminated fast.`,
        `💡 **Always have 1 player scanning** — knowing enemy positions wins fights.`,
        `💡 **Every kill = 1 pt!** 10 kills = huge advantage across 3 maps.`,
      ];
      return {
        text: `🔥 **Free Fire Pro Tip:**\n\n${tips[Math.floor(Math.random() * tips.length)]}\n\nWant another? Just ask! 😎`,
        quickReplies: ['💡 Another Tip', '📊 Scoring System', '🗺️ Maps'],
      };
    case 'admin':
      return {
        text: `🛡️ **Admin Access:**\n\nLogin → Staff Admin tab → Key: \`PANTHER2026\`\n\nAdmin manages slots, room credentials, match results & leaderboard.`,
        quickReplies: ['🔑 Room Info', '📋 Tournament Info', '📜 Rules'],
      };
    case 'help':
      return {
        text: `🐆 **Panther Bot can help with:**\n\n🎮 Tournament info\n🎯 Slot booking\n💰 Entry fee & prizes\n🗺️ Maps & schedule\n🔑 Room credentials\n📜 Rules\n📊 Scoring & leaderboard\n💡 Free Fire tips\n\nJust type your question! 🔥`,
        quickReplies: ['📋 Tournament Info', '🎯 Book a Slot', '🏆 Prizes', '📜 Rules'],
      };
    case 'bye':
      return {
        text: ['👋 **GL HF, soldier!** May your aim be true! 🐆🔥', '💪 **Go get that Booyah!** 🏆', '🔥 **Stay locked, stay lethal!** See you in the lobby! 🎮'][Math.floor(Math.random() * 3)],
        quickReplies: ['🎮 Tournament Info', '📋 Help'],
      };
    default:
      return {
        text: `🤔 I didn't quite catch that! Try asking about:\n• **Slots** — check or book\n• **Prizes** — prize breakdown\n• **Rules** — tournament regulations\n• **Room ID** — match credentials\n• **Tips** — Free Fire strategies\n\nOr just type a keyword! 🔥`,
        quickReplies: ['📋 Tournament Info', '🎯 Book a Slot', '🏆 Prizes', '📜 Rules'],
      };
  }
}

// ─── Initial Bot Message ──────────────────────────────────────────────────────
export const INITIAL_BOT_MESSAGE = {
  id: 'init-1',
  from: 'bot',
  text: `🐆 **Panther Bot Online!** ✨ Powered by AI\n\nI'm your Panthers Esports AI assistant — ask me anything about tournaments, slots, prizes, rules & more!\n\nWhat can I help you with? 👇`,
  quickReplies: ['📋 Tournament Info', '🎯 How to Book', '🏆 Prize Pool', '📜 Rules', '💡 FF Tips'],
  timestamp: new Date(),
};
