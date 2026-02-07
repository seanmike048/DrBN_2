import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MainNav from '@/components/MainNav';
import LanguageToggle from '@/components/LanguageToggle';
import OnboardingQuestionnaire from '@/components/OnboardingQuestionnaire';
import { guestStorage } from '@/lib/guestStorage';
import { supabase } from '@/integrations/supabase/client';

const DashboardLayout: React.FC = () => {
  const { user, loading, isGuest } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (isGuest) {
          // Check if guest has completed profile
          const guestProfile = guestStorage.getProfile();
          setNeedsOnboarding(!guestProfile);
        } else if (user) {
          // Check if authenticated user has completed profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('skin_type')
            .eq('id', user.id)
            .single();

          setNeedsOnboarding(!profile || !profile.skin_type);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (!loading) {
      checkOnboardingStatus();
    }
  }, [user, isGuest, loading]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/auth" replace />;
  }

  if (needsOnboarding) {
    return (
      <OnboardingQuestionnaire
        onComplete={() => setNeedsOnboarding(false)}
        onSkip={() => setNeedsOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-sand/30 z-30 shadow-sm">
        <div className="max-w-screen-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-xl text-charcoal tracking-tight">
            Beauté Noire
          </h1>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="max-w-screen-lg mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <MainNav />
    </div>
  );
};

export default DashboardLayout;
