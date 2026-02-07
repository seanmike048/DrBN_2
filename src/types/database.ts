// ============================================================================
// Dr Beauté Noire - Database Types
// Auto-generated types matching Supabase schema
// ============================================================================

export interface Profile {
  id: string; // UUID
  name?: string | null;
  country?: string | null;
  climate?: 'humid' | 'dry' | 'cold' | 'hot' | 'temperate' | null;

  skin_type?: string | null;
  sensitivity?: 'low' | 'medium' | 'high' | null;
  concerns?: string[];
  shaving_frequency?: string | null;

  age_range?: string | null;
  height?: number | null;
  weight?: number | null;
  gender?: string | null;

  budget_tier?: 'budget' | 'standard' | 'premium' | null;
  allergies?: string[];
  intolerances?: string[];

  created_at?: string;
  updated_at?: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  session_date: string;
  notes?: string | null;
  overall_score?: number | null;
  ai_summary?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CheckInPhoto {
  id: string;
  check_in_id: string;
  user_id: string;
  angle: 'front' | 'left_profile' | 'right_profile';
  storage_path: string;
  quality_score?: number | null;
  is_blurry?: boolean;
  is_dark?: boolean;
  face_detected?: boolean;
  created_at?: string;
}

export interface DerivedFeatures {
  id: string;
  check_in_id: string;
  user_id: string;
  uneven_tone_score?: number | null;
  texture_score?: number | null;
  oiliness_score?: number | null;
  barrier_comfort_score?: number | null;
  detected_concerns?: string[];
  ai_notes?: string | null;
  created_at?: string;
}

export interface Routine {
  id: string;
  user_id: string;
  check_in_id?: string | null;
  version: number;
  is_active: boolean;
  routine_name?: string | null;
  created_at?: string;
}

export interface RoutineStep {
  id: string;
  routine_id: string;
  user_id: string;
  time_of_day: 'morning' | 'midday' | 'evening' | 'weekly';
  step_order: number;
  category?: string | null;
  title: string;
  instructions?: string | null;
  timing?: string | null;
  frequency?: string | null;
  created_at?: string;
}

export interface ProductRecommendation {
  id: string;
  routine_step_id: string;
  user_id: string;
  tier: 'best' | 'budget' | 'premium';
  product_name: string;
  brand?: string | null;
  key_ingredients?: string[];
  why_recommended?: string | null;
  how_to_use?: string | null;
  cautions?: string | null;
  alternatives?: string[];
  estimated_price?: number | null;
  purchase_url?: string | null;
  created_at?: string;
}

export interface UserProduct {
  id: string;
  user_id: string;
  product_name: string;
  brand?: string | null;
  category?: string | null;
  key_ingredients?: string[];
  is_currently_using: boolean;
  purchase_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  is_audio_transcript: boolean;
  created_at?: string;
}

export interface UserSettings {
  id: string;
  language: 'en' | 'fr';
  plus_enabled: boolean;
  photo_analysis_consent: boolean;
  chat_context_consent: boolean;
  evolution_reminders: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Composite Types for UI/API
// ============================================================================

export interface CheckInWithPhotos extends CheckIn {
  photos: CheckInPhoto[];
  derived_features?: DerivedFeatures | null;
}

export interface RoutineWithSteps extends Routine {
  steps: (RoutineStep & {
    recommendations?: ProductRecommendation[];
  })[];
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateCheckInRequest {
  notes?: string;
  photos: {
    angle: 'front' | 'left_profile' | 'right_profile';
    file: File;
  }[];
}

export interface AnalysisRequest {
  profile: Partial<Profile>;
  latest_check_in?: CheckInWithPhotos;
  language: 'en' | 'fr';
  photos?: {
    front?: string;
    left?: string;
    right?: string;
  };
}

export interface AnalysisResponse {
  overall_score: number;
  summary: string;
  derived_features: {
    uneven_tone_score?: number;
    texture_score?: number;
    oiliness_score?: number;
    barrier_comfort_score?: number;
    detected_concerns?: string[];
    ai_notes?: string;
  };
  routine: {
    morning: RoutineStepData[];
    midday?: RoutineStepData[];
    evening: RoutineStepData[];
    weekly?: RoutineStepData[];
  };
  safety_notes: string[];
}

export interface RoutineStepData {
  step_order: number;
  category: string;
  title: string;
  instructions: string;
  timing?: string;
  frequency?: string;
  products: {
    best: ProductData;
    budget: ProductData;
    premium: ProductData;
  };
  tools_guidance?: string;
}

export interface ProductData {
  product_name: string;
  brand?: string;
  key_ingredients: string[];
  why_recommended: string;
  how_to_use: string;
  cautions?: string;
  alternatives?: string[];
  estimated_price?: number;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface PhotoCaptureState {
  front?: string | null;
  left_profile?: string | null;
  right_profile?: string | null;
}

export interface EvolutionTrendData {
  metric: string;
  values: {
    date: string;
    score: number;
  }[];
}
