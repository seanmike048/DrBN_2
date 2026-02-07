import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Routine, RoutineWithSteps, RoutineStep, ProductRecommendation } from '@/types/database';
import { useAuth } from './useAuth';

export const useRoutines = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch active routine
  const {
    data: activeRoutine,
    isLoading,
    error,
  } = useQuery<RoutineWithSteps | null>({
    queryKey: ['activeRoutine', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (routineError) {
        if (routineError.code === 'PGRST116') return null; // No active routine
        throw routineError;
      }

      // Fetch steps
      const { data: steps, error: stepsError } = await supabase
        .from('routine_steps')
        .select('*')
        .eq('routine_id', routine.id)
        .order('time_of_day')
        .order('step_order');

      if (stepsError) throw stepsError;

      // Fetch product recommendations for each step
      const stepsWithProducts = await Promise.all(
        (steps || []).map(async (step) => {
          const { data: recommendations } = await supabase
            .from('product_recommendations')
            .select('*')
            .eq('routine_step_id', step.id);

          return {
            ...step,
            recommendations: recommendations || [],
          };
        })
      );

      return {
        ...routine,
        steps: stepsWithProducts,
      };
    },
    enabled: !!user,
  });

  // Fetch all routine versions (for history)
  const {
    data: routineHistory,
    isLoading: isLoadingHistory,
  } = useQuery<Routine[]>({
    queryKey: ['routineHistory', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .order('version', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Create routine from AI analysis result
  const createRoutineMutation = useMutation({
    mutationFn: async ({
      analysisResult,
      checkInId,
    }: {
      analysisResult: any;
      checkInId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get next version number
      const { data: existingRoutines } = await supabase
        .from('routines')
        .select('version')
        .eq('user_id', user.id)
        .order('version', { ascending: false })
        .limit(1);

      const nextVersion = existingRoutines && existingRoutines.length > 0
        ? existingRoutines[0].version + 1
        : 1;

      // Deactivate previous routines
      await supabase
        .from('routines')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Create new routine
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .insert({
          user_id: user.id,
          check_in_id: checkInId,
          version: nextVersion,
          is_active: true,
          routine_name: `Routine v${nextVersion}`,
        })
        .select()
        .single();

      if (routineError) throw routineError;

      // Create steps and product recommendations
      const routineData = analysisResult.routine || {};

      for (const [timeOfDay, steps] of Object.entries(routineData)) {
        if (!Array.isArray(steps)) continue;

        for (const stepData of steps as any[]) {
          // Create step
          const { data: step, error: stepError } = await supabase
            .from('routine_steps')
            .insert({
              routine_id: routine.id,
              user_id: user.id,
              time_of_day: timeOfDay,
              step_order: stepData.step_order || 0,
              category: stepData.category,
              title: stepData.title,
              instructions: stepData.instructions,
              timing: stepData.timing,
              frequency: stepData.frequency,
            })
            .select()
            .single();

          if (stepError) throw stepError;

          // Create product recommendations
          if (stepData.products) {
            const productTiers: Array<'best' | 'budget' | 'premium'> = ['best', 'budget', 'premium'];

            for (const tier of productTiers) {
              const productData = stepData.products[tier];
              if (!productData) continue;

              await supabase.from('product_recommendations').insert({
                routine_step_id: step.id,
                user_id: user.id,
                tier,
                product_name: productData.product_name,
                brand: productData.brand,
                key_ingredients: productData.key_ingredients || [],
                why_recommended: productData.why_recommended,
                how_to_use: productData.how_to_use,
                cautions: productData.cautions,
                alternatives: productData.alternatives || [],
                estimated_price: productData.estimated_price,
              });
            }
          }
        }
      }

      return routine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoutine', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['routineHistory', user?.id] });
    },
  });

  return {
    activeRoutine,
    isLoading,
    error,
    routineHistory,
    isLoadingHistory,
    createRoutine: createRoutineMutation.mutate,
    isCreatingRoutine: createRoutineMutation.isPending,
  };
};
