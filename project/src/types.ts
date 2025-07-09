export interface User {
  id: string;
  email: string;
  name: string;
}

export interface JobDetails {
  role: string;
  company: string;
  jobDescription: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobDetails: JobDetails;
  resumeFile?: File;
  questions: Question[];
  answers: Answer[];
  score: number;
  duration: number;
  completedAt?: Date;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Answer {
  questionId: string;
  text: string;
  score: number;
  feedback: string;
  timestamp: number;
}

export interface TechnicalSetup {
  cameraEnabled: boolean;
  micEnabled: boolean;
  cameraPermission: 'granted' | 'denied' | 'pending';
  micPermission: 'granted' | 'denied' | 'pending';
}

export type Screen = 
  | 'landing'
  | 'onboarding'
  | 'summary'
  | 'live-session'
  | 'completion'
  | 'report';

export interface AppState {
  currentScreen: Screen;
  user: User | null;
  showAuthModal: boolean;
  authMode: 'signin' | 'signup';
  onboardingStep: number;
  jobDetails: JobDetails;
  resumeFile: File | null;
  technicalSetup: TechnicalSetup;
  currentSession: InterviewSession | null;
  showCompletionModal: boolean;
}