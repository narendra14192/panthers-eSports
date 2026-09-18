-- ============================================================================
-- PANTHERS ESPORTS — FREE FIRE TOURNAMENT PLATFORM SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Linked to auth.users if Supabase Auth is enabled)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT,
  free_fire_uid TEXT NOT NULL,
  in_game_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('Solo', 'Duo', 'Squad')),
  map TEXT NOT NULL CHECK (map IN ('Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'NeXTerra')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  entry_fee NUMERIC(10, 2) DEFAULT 0.00,
  prize_pool NUMERIC(10, 2) DEFAULT 0.00,
  prize_distribution JSONB DEFAULT '{"1st": "50%", "2nd": "30%", "3rd": "20%"}'::jsonb,
  total_slots INTEGER NOT NULL DEFAULT 12,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  room_id TEXT,
  room_password TEXT,
  rules TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  captain_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  captain_name TEXT NOT NULL,
  captain_phone TEXT,
  captain_uid TEXT NOT NULL,
  -- JSONB Array format: [{"name": "PantherAce", "uid": "104928182"}, ...]
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SLOTS TABLE (Crucial: Unique constraint prevents double-booking race condition)
CREATE TABLE IF NOT EXISTS public.slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'booked', 'checked_in', 'reserved')),
  booked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- UNIQUE CONSTRAINT: Only one team can hold a slot_number in a specific tournament
  CONSTRAINT unique_tournament_slot UNIQUE (tournament_id, slot_number)
);

-- 5. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL DEFAULT 1,
  map TEXT NOT NULL DEFAULT 'Bermuda',
  -- result_data format:
  -- [{"team_id": "uuid", "team_name": "Panther Claws", "placement": 1, "placement_pts": 12, "kills": 9, "kill_pts": 9, "total_pts": 21}]
  result_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  entered_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEADERBOARD TABLE
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE, -- NULL indicates Global All-Time
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  kills INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0, -- Booyahs
  matches_played INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tournament_team_leaderboard UNIQUE (tournament_id, team_id)
);

-- 7. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_slots_tournament_id ON public.slots(tournament_id);
CREATE INDEX IF NOT EXISTS idx_slots_team_id ON public.slots(team_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_tournament_pts ON public.leaderboard(tournament_id, points DESC, kills DESC);

-- ============================================================================
-- ATOMIC FUNCTION TO GENERATE TOURNAMENT SLOTS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_tournament_slots()
RETURNS TRIGGER AS $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..NEW.total_slots LOOP
    INSERT INTO public.slots (tournament_id, slot_number, status)
    VALUES (NEW.id, i, 'open')
    ON CONFLICT (tournament_id, slot_number) DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_slots ON public.tournaments;
CREATE TRIGGER trigger_auto_create_slots
AFTER INSERT ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.create_tournament_slots();

-- ============================================================================
-- ATOMIC FUNCTION TO BOOK A SLOT SAFELY (Race-Condition Prevention)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.book_tournament_slot(
  p_tournament_id UUID,
  p_slot_number INT,
  p_team_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_slot public.slots%ROWTYPE;
BEGIN
  -- Lock row exclusively for update
  SELECT * INTO v_slot
  FROM public.slots
  WHERE tournament_id = p_tournament_id AND slot_number = p_slot_number
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
  END IF;

  IF v_slot.status <> 'open' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot already taken by another team');
  END IF;

  -- Ensure team hasn't already booked another slot in this tournament
  IF EXISTS (
    SELECT 1 FROM public.slots 
    WHERE tournament_id = p_tournament_id AND team_id = p_team_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Your team has already registered for a slot in this tournament');
  END IF;

  UPDATE public.slots
  SET team_id = p_team_id,
      status = 'booked',
      booked_at = NOW()
  WHERE id = v_slot.id;

  RETURN jsonb_build_object('success', true, 'slot_id', v_slot.id, 'slot_number', p_slot_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Read policies: public access
CREATE POLICY "Public can view tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Public can view slots" ON public.slots FOR SELECT USING (true);
CREATE POLICY "Public can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public can view leaderboard" ON public.leaderboard FOR SELECT USING (true);

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.slots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
