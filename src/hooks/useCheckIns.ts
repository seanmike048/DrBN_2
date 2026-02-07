import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckIn, CheckInPhoto, CheckInWithPhotos, PhotoCaptureState } from '@/types/database';
import { useAuth } from './useAuth';

export const useCheckIns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all check-ins for the user
  const {
    data: checkIns,
    isLoading,
    error,
  } = useQuery<CheckInWithPhotos[]>({
    queryKey: ['checkIns', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data: checkInsData, error: checkInsError } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (checkInsError) throw checkInsError;

      // Fetch photos and derived features for each check-in
      const checkInsWithPhotos = await Promise.all(
        (checkInsData || []).map(async (checkIn) => {
          const { data: photos } = await supabase
            .from('check_in_photos')
            .select('*')
            .eq('check_in_id', checkIn.id)
            .order('angle');

          const { data: features } = await supabase
            .from('derived_features')
            .select('*')
            .eq('check_in_id', checkIn.id)
            .single();

          // Get signed URLs for photos
          const photosWithUrls = await Promise.all(
            (photos || []).map(async (photo) => {
              const { data: signedUrl } = await supabase.storage
                .from('check-in-photos')
                .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

              return {
                ...photo,
                url: signedUrl?.signedUrl || null,
              };
            })
          );

          return {
            ...checkIn,
            photos: photosWithUrls,
            derived_features: features,
          };
        })
      );

      return checkInsWithPhotos;
    },
    enabled: !!user,
  });

  // Create a new check-in with photos
  const createCheckInMutation = useMutation({
    mutationFn: async ({
      photos,
      notes,
    }: {
      photos: PhotoCaptureState;
      notes?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      setUploadProgress(0);

      // Step 1: Create check-in record
      const { data: checkIn, error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          notes,
        })
        .select()
        .single();

      if (checkInError) throw checkInError;
      setUploadProgress(20);

      // Step 2: Upload photos to storage and create photo records
      const photoAngles: Array<{ angle: 'front' | 'left_profile' | 'right_profile'; data: string }> = [];
      if (photos.front) photoAngles.push({ angle: 'front', data: photos.front });
      if (photos.left_profile) photoAngles.push({ angle: 'left_profile', data: photos.left_profile });
      if (photos.right_profile) photoAngles.push({ angle: 'right_profile', data: photos.right_profile });

      const uploadedPhotos: CheckInPhoto[] = [];

      for (let i = 0; i < photoAngles.length; i++) {
        const { angle, data } = photoAngles[i];

        // Convert base64 to blob
        const response = await fetch(data);
        const blob = await response.blob();

        // Generate storage path
        const fileName = `${user.id}/${checkIn.id}/${angle}_${Date.now()}.jpg`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('check-in-photos')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Create photo record
        const { data: photoRecord, error: photoError } = await supabase
          .from('check_in_photos')
          .insert({
            check_in_id: checkIn.id,
            user_id: user.id,
            angle,
            storage_path: fileName,
          })
          .select()
          .single();

        if (photoError) throw photoError;
        uploadedPhotos.push(photoRecord);

        setUploadProgress(20 + ((i + 1) / photoAngles.length) * 30);
      }

      setUploadProgress(50);

      // Step 3: Call AI analysis endpoint
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const analysisPayload = {
        profile: profile || {},
        photos: {
          front: photos.front,
          left_profile: photos.left_profile,
          right_profile: photos.right_profile,
        },
        language: 'en', // TODO: Get from user settings
      };

      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        'skin-analysis-v2',
        {
          body: analysisPayload,
        }
      );

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        // Don't throw - check-in is still valid without analysis
      }

      setUploadProgress(80);

      // Step 4: Save analysis results
      if (analysisResult) {
        // Update check-in with summary
        await supabase
          .from('check_ins')
          .update({
            overall_score: analysisResult.overall_score,
            ai_summary: analysisResult.summary,
          })
          .eq('id', checkIn.id);

        // Save derived features
        if (analysisResult.derived_features) {
          await supabase.from('derived_features').insert({
            check_in_id: checkIn.id,
            user_id: user.id,
            uneven_tone_score: analysisResult.derived_features.uneven_tone_score,
            texture_score: analysisResult.derived_features.texture_score,
            oiliness_score: analysisResult.derived_features.oiliness_score,
            barrier_comfort_score: analysisResult.derived_features.barrier_comfort_score,
            detected_concerns: analysisResult.derived_features.detected_concerns,
            ai_notes: analysisResult.derived_features.ai_notes,
          });
        }
      }

      setUploadProgress(100);

      return { checkIn, photos: uploadedPhotos, analysisResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns', user?.id] });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  // Delete a check-in (cascades to photos via DB triggers)
  const deleteCheckInMutation = useMutation({
    mutationFn: async (checkInId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Fetch photos to delete from storage
      const { data: photos } = await supabase
        .from('check_in_photos')
        .select('storage_path')
        .eq('check_in_id', checkInId);

      // Delete photos from storage
      if (photos && photos.length > 0) {
        const filePaths = photos.map((p) => p.storage_path);
        await supabase.storage.from('check-in-photos').remove(filePaths);
      }

      // Delete check-in (photos records cascade via DB)
      const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('id', checkInId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns', user?.id] });
    },
  });

  return {
    checkIns,
    isLoading,
    error,
    createCheckIn: createCheckInMutation.mutate,
    isCreating: createCheckInMutation.isPending,
    uploadProgress,
    deleteCheckIn: deleteCheckInMutation.mutate,
    isDeleting: deleteCheckInMutation.isPending,
  };
};
