import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import croixLogo from '/croix.png';

interface HomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onGuest: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onLogin, onSignup, onGuest }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col flex-1">
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center px-5 gap-12">
        {/* Cross Logo */}
        <div className="w-[220px] h-auto animate-fade-in">
          <img 
            src={croixLogo}
            alt="Docteur Beauté Noire"
            className="w-full h-auto object-contain"
            loading="eager"
          />
        </div>

        {/* Text Container */}
        <div className="flex flex-col items-center text-center w-full max-w-[350px] animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* DOCTEUR label */}
          <span className="label-docteur mb-4">
            {t('docteur')}
          </span>

          {/* Beauté Noire heading */}
          <h1 className="heading-main mb-8">
            {t('beauteNoire')}
          </h1>

          {/* Primary description */}
          <p className="text-body-primary mb-6 max-w-[310px]">
            {t('heroText')}
          </p>

          {/* Secondary description */}
          <p className="text-body-secondary max-w-[277px]">
            {t('heroSubtext')}
          </p>
        </div>
      </div>

      {/* Footer CTA Section */}
      <footer className="footer-container px-5 pt-5 pb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col items-center gap-3 w-full max-w-[350px] mx-auto">
          {/* Primary CTA Button */}
          <button
            onClick={onStart}
            className="btn-primary w-full h-14 flex items-center justify-center"
          >
            {t('startRoutine')}
          </button>

          {/* Auth Options */}
          <div className="w-full flex gap-3">
            <button
              onClick={onLogin}
              className="flex-1 h-12 border-2 border-gold/30 bg-transparent text-gold rounded-xl font-body font-medium hover:bg-gold/5 transition-all"
            >
              Log in
            </button>
            <button
              onClick={onSignup}
              className="flex-1 h-12 border-2 border-gold/30 bg-transparent text-gold rounded-xl font-body font-medium hover:bg-gold/5 transition-all"
            >
              Sign up
            </button>
          </div>

          {/* Guest Option */}
          <button
            onClick={onGuest}
            className="text-sm text-body-secondary hover:text-charcoal transition-colors underline"
          >
            Continue as guest
          </button>

          {/* Disclaimer */}
          <p className="text-disclaimer text-center mt-2">
            {t('disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
