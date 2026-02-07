import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { guestStorage, GuestProfile } from '@/lib/guestStorage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingQuestionnaireProps {
  onComplete: (profile: GuestProfile) => void;
  onSkip?: () => void;
}

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ onComplete, onSkip }) => {
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<GuestProfile>({});
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [ageInput, setAgeInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      key: 'skin_type',
      type: 'single',
      question: 'What is your skin type?',
      questionFr: 'Quel est votre type de peau ?',
      options: [
        { value: 'oily', label: 'Oily', labelFr: 'Grasse' },
        { value: 'dry', label: 'Dry', labelFr: 'Sèche' },
        { value: 'combination', label: 'Combination', labelFr: 'Mixte' },
        { value: 'normal', label: 'Normal', labelFr: 'Normale' },
        { value: 'sensitive', label: 'Sensitive', labelFr: 'Sensible' },
      ],
    },
    {
      key: 'main_concern',
      type: 'multi',
      maxSelections: 3,
      question: 'What are your main skin concerns? (Select up to 3)',
      questionFr: 'Quelles sont vos préoccupations principales ? (Sélectionnez jusqu\'à 3)',
      options: [
        { value: 'acne', label: 'Acne', labelFr: 'Acné' },
        { value: 'hyperpigmentation', label: 'Hyperpigmentation', labelFr: 'Hyperpigmentation' },
        { value: 'aging', label: 'Aging', labelFr: 'Vieillissement' },
        { value: 'dullness', label: 'Dullness', labelFr: 'Manque d\'éclat' },
        { value: 'dryness', label: 'Dryness', labelFr: 'Sécheresse' },
      ],
    },
    {
      key: 'age_range',
      type: 'numeric',
      question: 'What is your age?',
      questionFr: 'Quel est votre âge ?',
      min: 13,
      max: 100,
      placeholder: 'Enter your age',
    },
    {
      key: 'country',
      type: 'text',
      question: 'Where do you live? (Country/Region)',
      questionFr: 'Où habitez-vous ? (Pays/Région)',
      placeholder: 'e.g., France, USA, Nigeria',
    },
    {
      key: 'sun_exposure',
      type: 'single',
      question: 'How much sun exposure do you get?',
      questionFr: 'Quelle est votre exposition au soleil ?',
      options: [
        { value: 'minimal', label: 'Minimal (mostly indoors)', labelFr: 'Minimale (surtout à l\'intérieur)' },
        { value: 'moderate', label: 'Moderate (some outdoor time)', labelFr: 'Modérée (un peu à l\'extérieur)' },
        { value: 'high', label: 'High (frequently outdoors)', labelFr: 'Élevée (souvent à l\'extérieur)' },
      ],
    },
    {
      key: 'budget',
      type: 'single',
      question: 'What is your preferred budget range?',
      questionFr: 'Quel est votre budget préféré ?',
      options: [
        { value: 'low', label: 'Budget-friendly', labelFr: 'Économique' },
        { value: 'mid', label: 'Mid-range', labelFr: 'Moyen' },
        { value: 'premium', label: 'Premium', labelFr: 'Premium' },
      ],
    },
    {
      key: 'routine_complexity',
      type: 'single',
      question: 'Current routine complexity',
      questionFr: 'Complexité de votre routine actuelle',
      options: [
        { value: 'none', label: 'None / Just starting', labelFr: 'Aucune / Je débute' },
        { value: 'basic', label: 'Basic (2-3 steps)', labelFr: 'Basique (2-3 étapes)' },
        { value: 'moderate', label: 'Moderate (4-6 steps)', labelFr: 'Modérée (4-6 étapes)' },
        { value: 'extensive', label: 'Extensive (7+ steps)', labelFr: 'Complète (7+ étapes)' },
      ],
    },
    {
      key: 'approach_preference',
      type: 'single',
      question: 'Preferred skincare approach',
      questionFr: 'Approche de soins préférée',
      options: [
        { value: 'natural', label: 'Natural-first (plant-based, gentle)', labelFr: 'Naturel (à base de plantes, doux)' },
        { value: 'science', label: 'Science-first (active ingredients)', labelFr: 'Scientifique (actifs puissants)' },
      ],
    },
  ];

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const handleSelect = (value: string) => {
    const question = currentQuestion as any;

    if (question.type === 'multi') {
      // Multi-select logic
      const currentSelections = selectedConcerns;
      if (currentSelections.includes(value)) {
        // Deselect
        setSelectedConcerns(currentSelections.filter(v => v !== value));
      } else if (currentSelections.length < (question.maxSelections || 3)) {
        // Select (if under limit)
        setSelectedConcerns([...currentSelections, value]);
      }
    } else {
      // Single select
      setProfile({ ...profile, [question.key]: value });
    }
  };

  const handleTextInput = (value: string) => {
    const question = currentQuestion as any;
    setProfile({ ...profile, [question.key]: value });
  };

  const handleAgeInput = (value: string) => {
    setAgeInput(value);
    const age = parseInt(value);
    const question = currentQuestion as any;
    if (!isNaN(age) && age >= (question.min || 13) && age <= (question.max || 100)) {
      setProfile({ ...profile, [question.key]: value });
    } else {
      // Remove from profile if invalid
      const newProfile = { ...profile };
      delete newProfile[question.key];
      setProfile(newProfile);
    }
  };

  const handleNext = () => {
    const question = currentQuestion as any;

    // Save multi-select concerns before proceeding
    if (question.type === 'multi' && selectedConcerns.length > 0) {
      setProfile({ ...profile, [question.key]: selectedConcerns.join(',') });
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (isGuest) {
        // Save to localStorage for guest users
        guestStorage.saveProfile(profile);
      } else if (user) {
        // Save to Supabase for authenticated users
        await supabase.from('profiles').upsert({
          id: user.id,
          skin_type: profile.skin_type,
          concerns: profile.main_concern ? [profile.main_concern] : [],
          age_range: profile.age_range,
          country: profile.country,
          climate: profile.climate as any,
          budget_tier: profile.budget as any,
        });
      }

      onComplete(profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = currentQuestion as any;
  const currentValue = profile[question.key as keyof GuestProfile];

  // Determine if can proceed based on question type
  let canProceed = false;
  if (question.type === 'multi') {
    canProceed = selectedConcerns.length > 0;
  } else if (question.type === 'numeric') {
    canProceed = !!currentValue;
  } else if (question.type === 'text') {
    canProceed = !!currentValue && currentValue.length > 0;
  } else {
    canProceed = !!currentValue;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col p-4">
      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-body text-charcoal/70">
            Step {currentStep + 1} of {questions.length}
          </span>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-sm text-body-secondary hover:text-charcoal transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
        <div className="h-2 bg-sand/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-2xl w-full bg-white border-sand/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-charcoal text-center">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Single/Multi Select Options */}
            {(question.type === 'single' || question.type === 'multi') && question.options && question.options.map((option: any) => {
              const isSelected = question.type === 'multi'
                ? selectedConcerns.includes(option.value)
                : currentValue === option.value;
              const isDisabled = question.type === 'multi' && !isSelected && selectedConcerns.length >= (question.maxSelections || 3);

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  disabled={isDisabled}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    isSelected
                      ? 'border-gold bg-gold/10 shadow-sm'
                      : isDisabled
                      ? 'border-sand/20 bg-sand/5 opacity-50 cursor-not-allowed'
                      : 'border-sand/30 hover:border-gold/50 hover:bg-sand/10'
                  }`}
                >
                  <span className={`font-body ${isSelected ? 'text-charcoal font-semibold' : 'text-body-secondary'}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                      <Check className="w-4 h-4 text-cream" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Helper text for multi-select */}
            {question.type === 'multi' && selectedConcerns.length >= (question.maxSelections || 3) && (
              <p className="text-xs text-gold text-center">
                You've selected {question.maxSelections || 3} concerns (maximum reached)
              </p>
            )}

            {/* Numeric Input */}
            {question.type === 'numeric' && (
              <div>
                <input
                  type="number"
                  value={ageInput}
                  onChange={(e) => handleAgeInput(e.target.value)}
                  min={question.min || 13}
                  max={question.max || 100}
                  placeholder={question.placeholder || 'Enter value'}
                  className="w-full px-4 py-4 rounded-xl border-2 border-sand/30 bg-white text-charcoal text-lg font-body focus:outline-none focus:border-gold transition-all"
                />
                {ageInput && (parseInt(ageInput) < (question.min || 13) || parseInt(ageInput) > (question.max || 100)) && (
                  <p className="text-xs text-red-600 mt-2">
                    Please enter an age between {question.min || 13} and {question.max || 100}
                  </p>
                )}
              </div>
            )}

            {/* Text Input */}
            {question.type === 'text' && (
              <input
                type="text"
                value={(currentValue as string) || ''}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder={question.placeholder || 'Enter your answer'}
                className="w-full px-4 py-4 rounded-xl border-2 border-sand/30 bg-white text-charcoal text-lg font-body focus:outline-none focus:border-gold transition-all"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="max-w-2xl mx-auto w-full mt-6 flex gap-3">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-gold/30 text-gold hover:bg-gold/5"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={!canProceed || isSubmitting}
          className="flex-1 bg-gold text-cream hover:bg-gold/90"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-cream border-t-transparent" />
              Saving...
            </span>
          ) : isLastStep ? (
            'Complete'
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;
