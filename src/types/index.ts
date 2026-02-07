export interface UserProfile {
  skinType: string;
  concerns: string[];
  ageRange: string;
  sunExposure: string;
  currentRoutine: string;
  photoData?: string;
}

export interface AnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: Recommendation[];
  morningRoutine: RoutineStep[];
  eveningRoutine: RoutineStep[];
  ingredients: IngredientInfo[];
  overallScore: number;
  summary: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RoutineStep {
  step: number;
  product: string;
  instructions: string;
  timing?: string;
}

export interface IngredientInfo {
  name: string;
  benefit: string;
  safeForMelaninRich: boolean;
  caution?: string;
}

export interface QuizQuestion {
  id: string;
  titleKey: string;
  options: QuizOption[];
  multiSelect?: boolean;
}

export interface QuizOption {
  value: string;
  labelKey: string;
  icon?: React.ReactNode;
}
