import React from 'react';
import { RefreshCw, Star, Sun, Moon } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { AnalysisResult, RoutineStep, IngredientInfo } from '../types';

interface DashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1 px-5 pb-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-charcoal mb-2">
          {t('yourBlueprint')}
        </h1>
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-5 h-5 ${i < Math.round(result.overallScore / 20) ? 'text-gold fill-gold' : 'text-sand'}`} 
            />
          ))}
          <span className="ml-2 text-sm text-brown font-body">{result.overallScore}%</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gold/5 border border-gold/20 rounded-lg p-4 mb-6">
        <p className="text-body-primary text-center">
          {result.summary}
        </p>
      </div>

      {/* Skin Profile */}
      <div className="mb-6">
        <h3 className="font-display text-lg text-charcoal mb-3">Your Skin Profile</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-sand/30 rounded-full text-sm text-charcoal font-body">
            {result.skinType}
          </span>
          {result.concerns.map((concern) => (
            <span 
              key={concern}
              className="px-3 py-1 bg-gold/10 rounded-full text-sm text-gold font-body"
            >
              {concern}
            </span>
          ))}
        </div>
      </div>

      {/* Morning Routine */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5 text-gold" />
          <h3 className="font-display text-lg text-charcoal">Morning Routine</h3>
        </div>
        <div className="space-y-3">
          {result.morningRoutine.map((step) => (
            <RoutineStepCard key={step.step} step={step} />
          ))}
        </div>
      </div>

      {/* Evening Routine */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-5 h-5 text-gold" />
          <h3 className="font-display text-lg text-charcoal">Evening Routine</h3>
        </div>
        <div className="space-y-3">
          {result.eveningRoutine.map((step) => (
            <RoutineStepCard key={step.step} step={step} />
          ))}
        </div>
      </div>

      {/* Key Ingredients */}
      <div className="mb-8">
        <h3 className="font-display text-lg text-charcoal mb-3">Key Ingredients</h3>
        <div className="space-y-2">
          {result.ingredients.slice(0, 5).map((ingredient) => (
            <IngredientCard key={ingredient.name} ingredient={ingredient} />
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="secondary"
        onClick={onReset}
        className="w-full"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        {t('startOver')}
      </Button>
    </div>
  );
};

const RoutineStepCard: React.FC<{ step: RoutineStep }> = ({ step }) => (
  <div className="bg-cream border border-sand/50 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center text-sm text-gold font-body flex-shrink-0">
        {step.step}
      </span>
      <div>
        <h4 className="font-body font-medium text-charcoal">{step.product}</h4>
        <p className="text-sm text-brown font-body mt-1">{step.instructions}</p>
        {step.timing && (
          <span className="text-xs text-gold font-body mt-1 inline-block">{step.timing}</span>
        )}
      </div>
    </div>
  </div>
);

const IngredientCard: React.FC<{ ingredient: IngredientInfo }> = ({ ingredient }) => (
  <div className="flex items-center justify-between py-2 border-b border-sand/30 last:border-0">
    <div>
      <h4 className="font-body font-medium text-charcoal text-sm">{ingredient.name}</h4>
      <p className="text-xs text-brown font-body">{ingredient.benefit}</p>
    </div>
    {ingredient.safeForMelaninRich ? (
      <span className="text-xs text-green-600 font-body">✓ Safe</span>
    ) : (
      <span className="text-xs text-amber-600 font-body">⚠ Caution</span>
    )}
  </div>
);

export default Dashboard;
