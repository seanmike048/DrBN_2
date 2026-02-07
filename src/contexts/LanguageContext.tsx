import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  // Home page
  docteur: { en: 'DOCTEUR', fr: 'DOCTEUR' },
  beauteNoire: { en: 'Beauté Noire', fr: 'Beauté Noire' },
  heroText: {
    en: 'Get a personalized routine for melanin-rich skin in under 5 minutes.',
    fr: 'Obtenez une routine personnalisée pour peau riche en mélanine en moins de 5 minutes.'
  },
  heroSubtext: {
    en: 'Quick quiz and photo analysis to refine your results with AI.',
    fr: 'Quiz rapide et analyse photo pour affiner vos résultats avec l\'IA.'
  },
  startRoutine: { en: 'Start Your Routine', fr: 'Commencer Votre Routine' },
  disclaimer: {
    en: 'Not medical advice. For cosmetic improvement only.',
    fr: 'Non-conseil médical. À des fins cosmétiques uniquement.'
  },
  
  // Quiz
  skinType: { en: 'What is your skin type?', fr: 'Quel est votre type de peau ?' },
  oily: { en: 'Oily', fr: 'Grasse' },
  dry: { en: 'Dry', fr: 'Sèche' },
  combination: { en: 'Combination', fr: 'Mixte' },
  normal: { en: 'Normal', fr: 'Normale' },
  sensitive: { en: 'Sensitive', fr: 'Sensible' },
  
  skinConcerns: { en: 'What are your main skin concerns?', fr: 'Quelles sont vos préoccupations cutanées ?' },
  acne: { en: 'Acne', fr: 'Acné' },
  hyperpigmentation: { en: 'Hyperpigmentation', fr: 'Hyperpigmentation' },
  aging: { en: 'Aging', fr: 'Vieillissement' },
  dullness: { en: 'Dullness', fr: 'Teint terne' },
  dryness: { en: 'Dryness', fr: 'Sécheresse' },
  
  ageRange: { en: 'What is your age range?', fr: 'Quelle est votre tranche d\'âge ?' },
  under25: { en: 'Under 25', fr: 'Moins de 25 ans' },
  age2535: { en: '25-35', fr: '25-35' },
  age3545: { en: '35-45', fr: '35-45' },
  over45: { en: 'Over 45', fr: 'Plus de 45 ans' },
  
  sunExposure: { en: 'How much sun exposure do you get?', fr: 'Quelle exposition au soleil avez-vous ?' },
  minimal: { en: 'Minimal', fr: 'Minimale' },
  moderate: { en: 'Moderate', fr: 'Modérée' },
  high: { en: 'High', fr: 'Élevée' },
  
  currentRoutine: { en: 'What is your current skincare routine?', fr: 'Quelle est votre routine actuelle ?' },
  none: { en: 'None', fr: 'Aucune' },
  basic: { en: 'Basic', fr: 'Basique' },
  moderate_routine: { en: 'Moderate', fr: 'Modérée' },
  extensive: { en: 'Extensive', fr: 'Complète' },
  
  // Navigation
  back: { en: 'Back', fr: 'Retour' },
  next: { en: 'Next', fr: 'Suivant' },
  skip: { en: 'Skip', fr: 'Passer' },
  continue: { en: 'Continue', fr: 'Continuer' },
  
  // Camera
  cameraTitle: { en: 'Take a Photo', fr: 'Prendre une Photo' },
  cameraHint: { en: 'Position your face in the frame', fr: 'Positionnez votre visage dans le cadre' },
  capture: { en: 'Capture', fr: 'Capturer' },
  retake: { en: 'Retake', fr: 'Reprendre' },
  confirm: { en: 'Confirm Photo', fr: 'Confirmer la Photo' },
  cameraError: { en: 'Camera access denied', fr: 'Accès à la caméra refusé' },
  privacyNote: { en: 'Used only for analysis. Nothing is posted.', fr: 'Utilisé uniquement pour l\'analyse. Rien n\'est publié.' },
  
  // Results
  yourBlueprint: { en: 'Your Skin Blueprint', fr: 'Votre Plan Cutané' },
  analyzing: { en: 'Analyzing your skin...', fr: 'Analyse de votre peau...' },
  startOver: { en: 'Start Over', fr: 'Recommencer' },
  
  // Errors
  errorTitle: { en: 'Something went wrong', fr: 'Une erreur s\'est produite' },
  tryAgain: { en: 'Try Again', fr: 'Réessayer' },
  
  // Auth
  signIn: { en: 'Sign In', fr: 'Connexion' },
  signUp: { en: 'Sign Up', fr: 'S\'inscrire' },
  createAccount: { en: 'Create Account', fr: 'Créer un Compte' },
  email: { en: 'Email', fr: 'Email' },
  password: { en: 'Password', fr: 'Mot de passe' },
  confirmPassword: { en: 'Confirm Password', fr: 'Confirmer le mot de passe' },
  noAccount: { en: "Don't have an account? Sign up", fr: "Pas de compte ? S'inscrire" },
  haveAccount: { en: 'Already have an account? Sign in', fr: 'Déjà un compte ? Connexion' },
  passwordMismatch: { en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas' },
  passwordTooShort: { en: 'Password must be at least 6 characters', fr: 'Le mot de passe doit contenir au moins 6 caractères' },
  checkEmail: { en: 'Check your email to confirm your account', fr: 'Vérifiez votre email pour confirmer votre compte' },
  signOut: { en: 'Sign Out', fr: 'Déconnexion' },

  // 3-Photo Check-in
  frontPhoto: { en: 'Front View', fr: 'Vue de Face' },
  frontPhotoInstructions: { en: 'Face the camera directly with neutral expression', fr: 'Faites face à la caméra avec une expression neutre' },
  leftProfilePhoto: { en: 'Left Profile', fr: 'Profil Gauche' },
  leftProfileInstructions: { en: 'Turn your head to show your left profile', fr: 'Tournez votre tête pour montrer votre profil gauche' },
  rightProfilePhoto: { en: 'Right Profile', fr: 'Profil Droit' },
  rightProfileInstructions: { en: 'Turn your head to show your right profile', fr: 'Tournez votre tête pour montrer votre profil droit' },
  tooDark: { en: 'Photo may be too dark', fr: 'La photo peut être trop sombre' },

  // Dashboard/Navigation
  todayPlan: { en: 'Today Plan', fr: 'Plan du Jour' },
  evolution: { en: 'Evolution', fr: 'Évolution' },
  myProducts: { en: 'My Products', fr: 'Mes Produits' },
  tools: { en: 'Tools', fr: 'Outils' },
  nutrition: { en: 'Nutrition', fr: 'Nutrition' },
  chat: { en: 'Chat', fr: 'Discussion' },

  // Evolution
  checkInHistory: { en: 'Check-in History', fr: 'Historique des Vérifications' },
  comparePhotos: { en: 'Compare Photos', fr: 'Comparer les Photos' },
  trends: { en: 'Trends', fr: 'Tendances' },
  newCheckIn: { en: 'New Check-in', fr: 'Nouvelle Vérification' },
  baseline: { en: 'Baseline', fr: 'Référence' },
  latest: { en: 'Latest', fr: 'Dernier' },

  // Routines
  morningRoutine: { en: 'Morning Routine', fr: 'Routine Matinale' },
  eveningRoutine: { en: 'Evening Routine', fr: 'Routine du Soir' },
  weeklyRoutine: { en: 'Weekly Routine', fr: 'Routine Hebdomadaire' },
  bestPick: { en: 'Best Pick', fr: 'Meilleur Choix' },
  budgetPick: { en: 'Budget Pick', fr: 'Option Budget' },
  premiumPick: { en: 'Premium Pick', fr: 'Option Premium' },

  // Products
  addProduct: { en: 'Add Product', fr: 'Ajouter un Produit' },
  productName: { en: 'Product Name', fr: 'Nom du Produit' },
  brand: { en: 'Brand', fr: 'Marque' },
  category: { en: 'Category', fr: 'Catégorie' },
  keyIngredients: { en: 'Key Ingredients', fr: 'Ingrédients Clés' },

  // Plus Mode
  plusMode: { en: 'Plus Mode', fr: 'Mode Plus' },
  upgradeToPlus: { en: 'Upgrade to Plus', fr: 'Passer à Plus' },
  audioNote: { en: 'Audio Note', fr: 'Note Audio' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
