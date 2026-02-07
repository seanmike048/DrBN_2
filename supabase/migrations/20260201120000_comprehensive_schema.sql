-- ============================================================================
-- Dr Beauté Noire - Comprehensive Database Schema
-- Privacy-first skin tracking and personalized coaching platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER PROFILES (Extended Profile Data)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT,
  country TEXT,
  climate TEXT CHECK (climate IN ('humid', 'dry', 'cold', 'hot', 'temperate', NULL)),

  -- Skin Data
  skin_type TEXT,
  sensitivity TEXT CHECK (sensitivity IN ('low', 'medium', 'high', NULL)),
  concerns TEXT[] DEFAULT '{}',
  shaving_frequency TEXT,

  -- Optional Demographics
  age_range TEXT,
  height NUMERIC,
  weight NUMERIC,
  gender TEXT,

  -- Preferences
  budget_tier TEXT CHECK (budget_tier IN ('budget', 'standard', 'premium', NULL)) DEFAULT 'standard',
  allergies TEXT[] DEFAULT '{}',
  intolerances TEXT[] DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

-- ============================================================================
-- 2. CHECK-INS (Photo Sessions)
-- ============================================================================
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Metadata
  session_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,

  -- AI Analysis Results (summary only, full data in derived_features)
  overall_score NUMERIC(4,1) CHECK (overall_score >= 0 AND overall_score <= 100),
  ai_summary TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT check_ins_user_date_unique UNIQUE(user_id, session_date)
);

-- Enable RLS
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own check-ins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON public.check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON public.check_ins FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. CHECK-IN PHOTOS (Individual Photos - PRIVATE STORAGE)
-- ============================================================================
CREATE TABLE public.check_in_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Photo Data
  angle TEXT CHECK (angle IN ('front', 'left_profile', 'right_profile')) NOT NULL,
  storage_path TEXT NOT NULL, -- private bucket path

  -- Quality Metadata
  quality_score NUMERIC(3,1), -- 0-100
  is_blurry BOOLEAN DEFAULT false,
  is_dark BOOLEAN DEFAULT false,
  face_detected BOOLEAN,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(check_in_id, angle)
);

-- Enable RLS
ALTER TABLE public.check_in_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own photos"
  ON public.check_in_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON public.check_in_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.check_in_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 4. DERIVED FEATURES (AI-Derived Metrics per Check-in)
-- ============================================================================
CREATE TABLE public.derived_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Non-medical proxy metrics (for trends, not diagnosis)
  uneven_tone_score NUMERIC(4,1) CHECK (uneven_tone_score >= 0 AND uneven_tone_score <= 100),
  texture_score NUMERIC(4,1) CHECK (texture_score >= 0 AND texture_score <= 100),
  oiliness_score NUMERIC(4,1) CHECK (oiliness_score >= 0 AND oiliness_score <= 100),
  barrier_comfort_score NUMERIC(4,1) CHECK (barrier_comfort_score >= 0 AND barrier_comfort_score <= 100),

  -- AI-generated insights (cosmetic only)
  detected_concerns TEXT[] DEFAULT '{}',
  ai_notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(check_in_id)
);

-- Enable RLS
ALTER TABLE public.derived_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own features"
  ON public.derived_features FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own features"
  ON public.derived_features FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. ROUTINES (Versioned Routine Plans)
-- ============================================================================
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_id UUID REFERENCES public.check_ins(id) ON DELETE SET NULL,

  -- Version & Status
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  routine_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT routines_user_version_unique UNIQUE(user_id, version)
);

-- Enable RLS
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own routines"
  ON public.routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON public.routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON public.routines FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. ROUTINE STEPS (Individual Steps in a Routine)
-- ============================================================================
CREATE TABLE public.routine_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Step Details
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'midday', 'evening', 'weekly')) NOT NULL,
  step_order INTEGER NOT NULL,

  category TEXT, -- cleanser, serum, moisturizer, sunscreen, treatment, tool
  title TEXT NOT NULL,
  instructions TEXT,
  timing TEXT, -- e.g., "30 seconds", "2 minutes"

  -- Frequency (for weekly items)
  frequency TEXT, -- e.g., "2x per week"

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT routine_steps_order_unique UNIQUE(routine_id, time_of_day, step_order)
);

-- Enable RLS
ALTER TABLE public.routine_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own routine steps"
  ON public.routine_steps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routine steps"
  ON public.routine_steps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own routine steps"
  ON public.routine_steps FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 7. PRODUCT RECOMMENDATIONS (AI-Recommended Products for Steps)
-- ============================================================================
CREATE TABLE public.product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_step_id UUID REFERENCES public.routine_steps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Product Details
  tier TEXT CHECK (tier IN ('best', 'budget', 'premium')) NOT NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  key_ingredients TEXT[] DEFAULT '{}',

  -- Guidance
  why_recommended TEXT, -- Why this product fits
  how_to_use TEXT,
  cautions TEXT,
  alternatives TEXT[] DEFAULT '{}',

  -- Availability (optional)
  estimated_price NUMERIC(10,2),
  purchase_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT product_recs_step_tier_unique UNIQUE(routine_step_id, tier)
);

-- Enable RLS
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own product recs"
  ON public.product_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product recs"
  ON public.product_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. USER PRODUCTS (User Inventory - "My Products")
-- ============================================================================
CREATE TABLE public.user_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Product Info
  product_name TEXT NOT NULL,
  brand TEXT,
  category TEXT, -- cleanser, serum, moisturizer, sunscreen, exfoliant, tool
  key_ingredients TEXT[] DEFAULT '{}',

  -- Usage
  is_currently_using BOOLEAN DEFAULT true,
  purchase_date DATE,
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own products"
  ON public.user_products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 9. CHAT SESSIONS (For Plus Mode Direct Chat)
-- ============================================================================
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  title TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own chat sessions"
  ON public.chat_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. CHAT MESSAGES (Individual Messages - NO PHOTOS STORED)
-- ============================================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,

  -- Audio transcript support
  is_audio_transcript BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 11. USER SETTINGS (Preferences & Consents)
-- ============================================================================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Preferences
  language TEXT CHECK (language IN ('en', 'fr')) DEFAULT 'en',

  -- Feature Flags
  plus_enabled BOOLEAN DEFAULT false,

  -- Consents
  photo_analysis_consent BOOLEAN DEFAULT false,
  chat_context_consent BOOLEAN DEFAULT false, -- consent to use profile+latest check-in in chat

  -- Notifications
  evolution_reminders BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(id)
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_settings
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_settings();

-- ============================================================================
-- STORAGE BUCKET SETUP (Run via Supabase Dashboard or CLI)
-- ============================================================================

-- Create private storage bucket for user photos
-- This must be created via Supabase dashboard or CLI:
--
-- 1. Create bucket: "check-in-photos" (private, not public)
-- 2. Set RLS policies on storage.objects:
--    - Users can upload: bucket_id = 'check-in-photos' AND auth.uid() = owner
--    - Users can view own: bucket_id = 'check-in-photos' AND auth.uid() = owner
--    - Users can delete own: bucket_id = 'check-in-photos' AND auth.uid() = owner
--
-- Example RLS for storage (if not using dashboard):
-- CREATE POLICY "Users can upload own photos"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'check-in-photos' AND auth.uid() = owner);
--
-- CREATE POLICY "Users can view own photos"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'check-in-photos' AND auth.uid() = owner);
--
-- CREATE POLICY "Users can delete own photos"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'check-in-photos' AND auth.uid() = owner);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX idx_check_ins_user_date ON public.check_ins(user_id, session_date DESC);
CREATE INDEX idx_check_in_photos_check_in ON public.check_in_photos(check_in_id);
CREATE INDEX idx_derived_features_check_in ON public.derived_features(check_in_id);
CREATE INDEX idx_routines_user_active ON public.routines(user_id, is_active DESC, version DESC);
CREATE INDEX idx_routine_steps_routine ON public.routine_steps(routine_id, time_of_day, step_order);
CREATE INDEX idx_product_recs_step ON public.product_recommendations(routine_step_id);
CREATE INDEX idx_user_products_user ON public.user_products(user_id, is_currently_using DESC);
CREATE INDEX idx_chat_sessions_user ON public.chat_sessions(user_id, is_active DESC);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to tables with updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER check_ins_updated_at BEFORE UPDATE ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_products_updated_at BEFORE UPDATE ON public.user_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Run migration: supabase db push or supabase migration up
-- 2. Create storage bucket "check-in-photos" with RLS
-- 3. Configure storage policies via dashboard
-- ============================================================================
