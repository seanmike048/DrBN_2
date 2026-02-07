/**
 * Firebase Cloud Functions client for AI analysis
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

/**
 * Call Firebase Cloud Function for skin analysis
 */
export async function generateSkinAnalysis(
  request: SkinAnalysisRequest
): Promise<SkinAnalysisResponse> {
  const url = `${FUNCTIONS_BASE_URL}/skinAnalysis`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate skin analysis';

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from AI service');
    }

    return data as SkinAnalysisResponse;
  } catch (error) {
    console.error('Firebase Function error:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Network error calling AI service');
  }
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/health`, {
      method: 'GET',
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
