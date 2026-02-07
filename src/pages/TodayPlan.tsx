import React, { useState } from 'react';
import { useRoutines } from '@/hooks/useRoutines';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Info, ChevronDown, ChevronUp, Package, Sparkles, Camera } from 'lucide-react';
import ProductCarousel from '@/components/ProductCarousel';
import ThreePhotoCheckIn from '@/components/ThreePhotoCheckIn';
import { useAuth } from '@/hooks/useAuth';
import { guestStorage } from '@/lib/guestStorage';
import { supabase } from '@/integrations/supabase/client';
import { PhotoCaptureState } from '@/types/database';
import { toast } from 'sonner';
import { generateSkinAnalysis } from '@/lib/firebaseFunctions';

const TodayPlan: React.FC = () => {
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  const { activeRoutine, isLoading, createRoutine } = useRoutines();
  const [selectedTab, setSelectedTab] = useState('morning');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlanWithoutPhotos = async () => {
    setIsGenerating(true);

    try {
      // Get profile data
      let profileData: any;
      if (isGuest) {
        profileData = guestStorage.getProfile();
      } else if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profileData = data;
      }

      if (!profileData) {
        toast.error('Please complete your profile first');
        setIsGenerating(false);
        return;
      }

      // Call Firebase Cloud Function for AI analysis
      const data = await generateSkinAnalysis({
        profile: {
          skinType: profileData.skin_type,
          concerns: Array.isArray(profileData.concerns) ? profileData.concerns :
                   (profileData.main_concern ? profileData.main_concern.split(',').map((c: string) => c.trim()) : []),
          ageRange: profileData.age_range,
          sunExposure: profileData.sun_exposure,
          currentRoutine: profileData.routine_complexity,
        },
        language: 'en',
      });

      // Save plan
      if (isGuest) {
        guestStorage.savePlan({
          routine_name: 'My Routine',
          routine: data,
          summary: data.summary,
          overall_score: data.overallScore,
        });
        window.location.reload(); // Reload to show new plan
      } else if (user) {
        // Create routine in database
        createRoutine({ analysisResult: { routine: data } });
      }

      toast.success('Your personalized plan has been generated!');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoComplete = async (photos: PhotoCaptureState) => {
    setShowPhotoModal(false);
    setIsGenerating(true);

    try {
      // Similar to generatePlanWithoutPhotos but include photos
      let profileData: any;
      if (isGuest) {
        profileData = guestStorage.getProfile();
      } else if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        profileData = data;
      }

      // Call Firebase Cloud Function for AI analysis with photo
      const data = await generateSkinAnalysis({
        profile: {
          skinType: profileData.skin_type,
          concerns: Array.isArray(profileData.concerns) ? profileData.concerns :
                   (profileData.main_concern ? profileData.main_concern.split(',').map((c: string) => c.trim()) : []),
          ageRange: profileData.age_range,
          sunExposure: profileData.sun_exposure,
          currentRoutine: profileData.routine_complexity,
          photoData: photos.front, // Include front photo
        },
        language: 'en',
      });

      // Save plan
      if (isGuest) {
        guestStorage.savePlan({
          routine_name: 'My Routine',
          routine: data,
          summary: data.summary,
          overall_score: data.overallScore,
        });
        window.location.reload();
      } else if (user) {
        createRoutine({ analysisResult: { routine: data } });
      }

      toast.success('Your personalized plan has been generated!');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gold border-t-transparent" />
      </div>
    );
  }

  // Check for guest plan
  const guestPlan = isGuest ? guestStorage.getActivePlan() : null;

  if (!activeRoutine && !guestPlan) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-[100px] h-auto mx-auto mb-6">
            <img
              src="/croix.png"
              alt="Docteur Beauté Noire"
              className="w-full h-auto object-contain"
            />
          </div>
          <h2 className="font-display text-2xl text-charcoal mb-2">Generate Your Plan</h2>
          <p className="text-body-secondary mb-8">
            Get your personalized skincare routine based on your profile and skin analysis.
          </p>

          <div className="space-y-4">
            <Button
              onClick={generatePlanWithoutPhotos}
              disabled={isGenerating}
              className="w-full h-14 bg-gold text-cream hover:bg-gold/90 text-base"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-cream border-t-transparent" />
                  Generating...
                </span>
              ) : (
                'Generate Plan (No Photos)'
              )}
            </Button>

            <Button
              onClick={() => setShowPhotoModal(true)}
              variant="outline"
              className="w-full h-14 border-gold/30 text-gold hover:bg-gold/5 text-base"
            >
              <Camera className="w-5 h-5 mr-2" />
              Add Photos for Deeper Analysis
            </Button>
          </div>

          <p className="text-xs text-body-secondary mt-6">
            Photos are optional. You can generate a great plan using just your profile information.
          </p>
        </div>

        {/* Photo Modal */}
        {showPhotoModal && (
          <ThreePhotoCheckIn
            onComplete={handlePhotoComplete}
            onClose={() => setShowPhotoModal(false)}
          />
        )}
      </div>
    );
  }

  // Handle both authenticated routines and guest plans
  const displayPlan = activeRoutine || (guestPlan ? convertGuestPlanToRoutine(guestPlan) : null);

  if (!displayPlan) {
    return null; // Should not reach here due to empty state above
  }

  const stepsByTime = {
    morning: displayPlan.steps.filter((s) => s.time_of_day === 'morning'),
    midday: displayPlan.steps.filter((s) => s.time_of_day === 'midday'),
    evening: displayPlan.steps.filter((s) => s.time_of_day === 'evening'),
    weekly: displayPlan.steps.filter((s) => s.time_of_day === 'weekly'),
  };

  function convertGuestPlanToRoutine(plan: any): any {
    // Convert guest plan format to routine format for display
    const steps: any[] = [];
    let stepId = 0;

    ['morningRoutine', 'eveningRoutine'].forEach((routineKey, idx) => {
      const timeOfDay = routineKey === 'morningRoutine' ? 'morning' : 'evening';
      const routineSteps = plan.routine?.[routineKey] || [];

      routineSteps.forEach((step: any) => {
        steps.push({
          id: `guest_step_${stepId++}`,
          time_of_day: timeOfDay,
          step_order: step.step || stepId,
          category: 'skincare',
          title: step.product || `Step ${step.step}`,
          instructions: step.instructions || '',
          timing: step.timing || '',
          recommendations: [],
        });
      });
    });

    return {
      ...plan,
      routine_name: plan.routine_name || 'My Routine',
      created_at: plan.created_at,
      steps,
    };
  }

  return (
    <div className="p-4 pb-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-charcoal mb-2">{t('todayPlan')}</h1>
        <p className="text-body-secondary">
          {displayPlan.routine_name} · Created {new Date(displayPlan.created_at!).toLocaleDateString()}
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full bg-sand/30 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="morning"
            className="flex-1 data-[state=active]:bg-cream data-[state=active]:text-gold data-[state=active]:shadow-sm rounded-lg font-body font-medium"
          >
            {t('morningRoutine')}
          </TabsTrigger>
          {stepsByTime.midday.length > 0 && (
            <TabsTrigger
              value="midday"
              className="flex-1 data-[state=active]:bg-cream data-[state=active]:text-gold data-[state=active]:shadow-sm rounded-lg font-body font-medium"
            >
              Midday
            </TabsTrigger>
          )}
          <TabsTrigger
            value="evening"
            className="flex-1 data-[state=active]:bg-cream data-[state=active]:text-gold data-[state=active]:shadow-sm rounded-lg font-body font-medium"
          >
            {t('eveningRoutine')}
          </TabsTrigger>
          {stepsByTime.weekly.length > 0 && (
            <TabsTrigger
              value="weekly"
              className="flex-1 data-[state=active]:bg-cream data-[state=active]:text-gold data-[state=active]:shadow-sm rounded-lg font-body font-medium"
            >
              {t('weeklyRoutine')}
            </TabsTrigger>
          )}
        </TabsList>

        {(['morning', 'midday', 'evening', 'weekly'] as const).map((timeOfDay) => (
          <TabsContent key={timeOfDay} value={timeOfDay} className="space-y-4">
            {stepsByTime[timeOfDay].length === 0 ? (
              <Card className="bg-white border-sand/50">
                <CardContent className="p-6 text-center text-body-secondary">
                  No steps for this time
                </CardContent>
              </Card>
            ) : (
              stepsByTime[timeOfDay].map((step) => {
                const isExpanded = expandedStep === step.id;
                const hasProducts = step.recommendations && step.recommendations.length > 0;

                return (
                  <Card key={step.id} className="bg-white border-sand/50 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-body font-semibold text-charcoal">
                            {step.step_order}. {step.title}
                          </CardTitle>
                          {step.category && (
                            <p className="text-xs text-gold uppercase tracking-wide mt-1">
                              {step.category}
                            </p>
                          )}
                        </div>
                        {step.timing && (
                          <div className="flex items-center gap-1 text-body-secondary text-sm ml-3">
                            <Clock className="w-4 h-4" />
                            <span>{step.timing}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-body-secondary text-sm leading-relaxed mb-4">
                        {step.instructions}
                      </p>

                      {step.frequency && (
                        <p className="text-xs text-gold mb-3">
                          <strong>Frequency:</strong> {step.frequency}
                        </p>
                      )}

                      {/* Product Recommendations Toggle */}
                      {hasProducts && (
                        <>
                          <button
                            onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                            className="w-full flex items-center justify-between p-3 bg-sand/20 rounded-lg hover:bg-sand/30 transition-colors mt-3"
                          >
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gold" />
                              <span className="text-sm font-medium text-charcoal">
                                {step.recommendations!.length} Product Recommendation{step.recommendations!.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gold" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gold" />
                            )}
                          </button>

                          {/* Product Carousel - Expanded State */}
                          {isExpanded && (
                            <div className="mt-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                              <ProductCarousel recommendations={step.recommendations!} />
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Safety Note */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Note:</strong> {t('disclaimer')} If you experience persistent irritation, rapid skin
          changes, or severe reactions, please consult a dermatologist.
        </p>
      </div>
    </div>
  );
};

export default TodayPlan;
