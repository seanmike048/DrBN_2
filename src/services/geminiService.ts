import { UserProfile, AnalysisResult } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const generateSkinAnalysis = async (
  profile: UserProfile, 
  language: string = 'en'
): Promise<AnalysisResult> => {
  const { data, error } = await supabase.functions.invoke('skin-analysis', {
    body: { profile, language }
  });

  if (error) {
    console.error('Skin analysis error:', error);
    throw new Error(error.message || 'Failed to generate skin analysis');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AnalysisResult;
};
