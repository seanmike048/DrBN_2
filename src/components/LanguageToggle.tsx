import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="lang-toggle px-2 py-1 rounded-lg transition-colors duration-200 hover:bg-sand/20 focus:outline-none focus:ring-2 focus:ring-gold/30"
      aria-label={`Switch to ${language === 'en' ? 'French' : 'English'}`}
    >
      <span className={language === 'en' ? 'font-semibold' : 'opacity-60'}>EN</span>
      <span className="mx-1 opacity-40">/</span>
      <span className={language === 'fr' ? 'font-semibold' : 'opacity-60'}>FR</span>
    </button>
  );
};

export default LanguageToggle;
