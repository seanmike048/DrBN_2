import { UserProfile, AnalysisResult } from '../types';
import { generateSkinAnalysis } from '@/lib/firebaseFunctions';

/**
 * Generate skin analysis via Firebase Cloud Functions → Gemini.
 * This is a thin wrapper that maps the UserProfile type to the
 * SkinAnalysisRequest shape expected by firebaseFunctions.ts.
 */
export const generateSkinAnalysisFromProfile = async (
  profile: UserProfile,
  language: string = 'en'
): Promise<AnalysisResult> => {
  const data = await generateSkinAnalysis({
    profile: {
      skinType: profile.skinType,
      concerns: profile.concerns,
      ageRange: profile.ageRange,
      sunExposure: profile.sunExposure,
      currentRoutine: profile.currentRoutine,
      photoData: profile.photoData,
    },
    language: language as 'en' | 'fr',
  });

  return data as AnalysisResult;
};

// Re-export under the old name for backward compatibility
export { generateSkinAnalysisFromProfile as generateSkinAnalysis };
