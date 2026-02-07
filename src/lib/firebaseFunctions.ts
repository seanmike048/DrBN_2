/**
 * Firebase Cloud Functions client for AI analysis
 * Single source of truth for all AI calls.
 */

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL ||
  'https://us-central1-drbn1-40b01.cloudfunctions.net';

export interface SkinAnalysisRequest {
  profile: {
    skinType?: string;
    concerns?: string[];
    ageRange?: string;
    sunExposure?: string;
    currentRoutine?: string;
    photoData?: string;
  };
  language?: 'en' | 'fr';
}

export interface SkinAnalysisResponse {
  skinType: string;
  concerns: string[];
  overallScore: number;
  summary: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  morningRoutine: Array<{
    step: number;
    product: string;
    instructions: string;
    timing: string;
  }>;
  eveningRoutine: Array<{
    step: number;
    product: string;
    instructions: string;
    timing: string;
  }>;
  ingredients: Array<{
    name: string;
    benefit: string;
    safeForMelaninRich: boolean;
    caution?: string;
  }>;
}

export interface AnalyzePhotoRequest {
  imageBase64: string;
  prompt?: string;
  lang?: 'en' | 'fr';
}

export interface AnalyzePhotoResponse {
  ok: boolean;
  analysisText: string;
}

/**
 * Call Firebase Cloud Function for structured skin analysis (plan generation).
 */
export async function generateSkinAnalysis(
  request: SkinAnalysisRequest
): Promise<SkinAnalysisResponse> {
  const url = `${FUNCTIONS_BASE_URL}/skinAnalysis`;

  console.log('[AI] Calling skinAnalysis:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('[AI] skinAnalysis response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to generate skin analysis';

      try {
        const errorData = await response.json();
        console.error('[AI] skinAnalysis error response:', errorData);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[AI] skinAnalysis success, keys:', Object.keys(data));

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from AI service');
    }

    return data as SkinAnalysisResponse;
  } catch (error) {
    console.error('[AI] Firebase Function error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Network error calling AI service');
  }
}

/**
 * Call Firebase Cloud Function for photo analysis (single photo).
 */
export async function analyzePhoto(
  request: AnalyzePhotoRequest
): Promise<AnalyzePhotoResponse> {
  const url = `${FUNCTIONS_BASE_URL}/analyzePhoto`;

  console.log('[AI] Calling analyzePhoto:', url, 'imageBase64 length:', request.imageBase64?.length);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('[AI] analyzePhoto response status:', response.status);

    if (!response.ok) {
      let errorMessage = 'Failed to analyze photo';

      try {
        const errorData = await response.json();
        console.error('[AI] analyzePhoto error response:', errorData);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[AI] analyzePhoto success, ok:', data.ok, 'analysisText length:', data.analysisText?.length);

    if (!data || !data.ok) {
      throw new Error(data?.error || 'Invalid response from photo analysis');
    }

    return data as AnalyzePhotoResponse;
  } catch (error) {
    console.error('[AI] analyzePhoto error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Network error calling photo analysis');
  }
}

/**
 * Analyze multiple check-in photos via Firebase Cloud Function.
 * Calls analyzePhoto for the front photo and returns a structured result
 * compatible with the check-in flow expectations.
 */
export async function analyzeCheckInPhotos(payload: {
  profile: Record<string, unknown>;
  photos: {
    front?: string | null;
    left_profile?: string | null;
    right_profile?: string | null;
  };
  language: 'en' | 'fr';
}): Promise<{
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
}> {
  // Use the front photo (primary) for analysis
  const photoToAnalyze = payload.photos.front || payload.photos.left_profile || payload.photos.right_profile;

  if (!photoToAnalyze) {
    throw new Error('No photo available for analysis');
  }

  // Call the skinAnalysis endpoint with profile + photo data for a structured result
  const url = `${FUNCTIONS_BASE_URL}/skinAnalysis`;

  console.log('[AI] Calling skinAnalysis for check-in, photo length:', photoToAnalyze.length);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      profile: payload.profile,
      language: payload.language,
      photoData: photoToAnalyze,
    }),
  });

  console.log('[AI] skinAnalysis (check-in) response status:', response.status);

  if (!response.ok) {
    let errorMessage = 'Failed to analyze check-in photos';
    try {
      const errorData = await response.json();
      console.error('[AI] skinAnalysis (check-in) error:', errorData);
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log('[AI] skinAnalysis (check-in) success, keys:', Object.keys(data));

  // Map the skinAnalysis response to the check-in expected format
  return {
    overall_score: data.overallScore ?? 75,
    summary: data.summary ?? 'Analysis complete.',
    derived_features: {
      detected_concerns: data.concerns ?? [],
      ai_notes: data.summary ?? '',
    },
  };
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const url = `${FUNCTIONS_BASE_URL}/health`;
    console.log('[AI] Health check:', url);

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('[AI] Health check failed, status:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('[AI] Health check result:', data);
    return data.ok === true;
  } catch (error) {
    console.error('[AI] Health check failed:', error);
    return false;
  }
}
