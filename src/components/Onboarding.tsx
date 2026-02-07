import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';
import CameraCapture from './CameraCapture';
import { useLanguage } from '../contexts/LanguageContext';
import { UserProfile, QuizQuestion, QuizOption } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBack: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBack }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    concerns: [],
  });

  const questions: QuizQuestion[] = [
    {
      id: 'skinType',
      titleKey: 'skinType',
      options: [
        { value: 'oily', labelKey: 'oily' },
        { value: 'dry', labelKey: 'dry' },
        { value: 'combination', labelKey: 'combination' },
        { value: 'normal', labelKey: 'normal' },
        { value: 'sensitive', labelKey: 'sensitive' },
      ]
    },
    {
      id: 'concerns',
      titleKey: 'skinConcerns',
      multiSelect: true,
      options: [
        { value: 'acne', labelKey: 'acne' },
        { value: 'hyperpigmentation', labelKey: 'hyperpigmentation' },
        { value: 'aging', labelKey: 'aging' },
        { value: 'dullness', labelKey: 'dullness' },
        { value: 'dryness', labelKey: 'dryness' },
      ]
    },
    {
      id: 'ageRange',
      titleKey: 'ageRange',
      options: [
        { value: 'under25', labelKey: 'under25' },
        { value: '25-35', labelKey: 'age2535' },
        { value: '35-45', labelKey: 'age3545' },
        { value: 'over45', labelKey: 'over45' },
      ]
    },
    {
      id: 'sunExposure',
      titleKey: 'sunExposure',
      options: [
        { value: 'minimal', labelKey: 'minimal' },
        { value: 'moderate', labelKey: 'moderate' },
        { value: 'high', labelKey: 'high' },
      ]
    },
    {
      id: 'currentRoutine',
      titleKey: 'currentRoutine',
      options: [
        { value: 'none', labelKey: 'none' },
        { value: 'basic', labelKey: 'basic' },
        { value: 'moderate', labelKey: 'moderate_routine' },
        { value: 'extensive', labelKey: 'extensive' },
      ]
    }
  ];

  const totalSteps = questions.length;
  const currentQuestion = questions[step - 1];

  const handleSelect = (value: string) => {
    if (currentQuestion.multiSelect) {
      const concerns = profile.concerns || [];
      const newConcerns = concerns.includes(value)
        ? concerns.filter(c => c !== value)
        : [...concerns, value];
      setProfile({ ...profile, concerns: newConcerns });
    } else {
      setProfile({ ...profile, [currentQuestion.id]: value });
    }
  };

  const isSelected = (value: string) => {
    if (currentQuestion.multiSelect) {
      return (profile.concerns || []).includes(value);
    }
    return profile[currentQuestion.id as keyof UserProfile] === value;
  };

  const canProceed = () => {
    if (currentQuestion.multiSelect) {
      return (profile.concerns || []).length > 0;
    }
    return !!profile[currentQuestion.id as keyof UserProfile];
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setShowCamera(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleCameraComplete = (photos: { front?: string }) => {
    const finalProfile: UserProfile = {
      skinType: profile.skinType || '',
      concerns: profile.concerns || [],
      ageRange: profile.ageRange || '',
      sunExposure: profile.sunExposure || '',
      currentRoutine: profile.currentRoutine || '',
      photoData: photos.front,
    };
    setShowCamera(false);
    onComplete(finalProfile);
  };

  const handleCameraSkip = () => {
    const finalProfile: UserProfile = {
      skinType: profile.skinType || '',
      concerns: profile.concerns || [],
      ageRange: profile.ageRange || '',
      sunExposure: profile.sunExposure || '',
      currentRoutine: profile.currentRoutine || '',
    };
    setShowCamera(false);
    onComplete(finalProfile);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraCapture 
        onCaptureComplete={handleCameraComplete} 
        onSkip={handleCameraSkip}
        onClose={handleCameraClose}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 px-5 pb-6">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="h-1 bg-sand/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-brown font-body">{step}/{totalSteps}</span>
      </div>

      {/* Question */}
      <div className="flex-1">
        <h2 className="font-display text-2xl text-charcoal mb-8 text-center">
          {t(currentQuestion.titleKey)}
        </h2>

        <div className="flex flex-col gap-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full py-4 px-6 rounded-lg border-2 text-left font-body transition-all duration-200
                ${isSelected(option.value) 
                  ? 'border-gold bg-gold/5 text-charcoal' 
                  : 'border-sand/50 bg-cream hover:border-gold/50 text-charcoal/80'
                }
              `}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <Button
        variant="primary"
        onClick={handleNext}
        disabled={!canProceed()}
        className="w-full mt-6"
      >
        {step === totalSteps ? t('continue') : t('next')}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default Onboarding;
