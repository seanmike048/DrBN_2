import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-5">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-4 border-sand rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
      <h2 className="font-display text-2xl text-charcoal mb-2 text-center">
        {t('analyzing')}
      </h2>
      <p className="text-body-secondary text-center max-w-xs">
        Our AI is analyzing your skin profile to create personalized recommendations.
      </p>
    </div>
  );
};

export default LoadingScreen;
