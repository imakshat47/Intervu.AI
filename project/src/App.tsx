import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { OnboardingPage } from './components/OnboardingPage';
import { InterviewSummary } from './components/InterviewSummary';
import { LiveInterviewSession } from './components/LiveInterviewSession';
import { CompletionModal } from './components/CompletionModal';
import { InterviewReport } from './components/InterviewReport';
import UserHistory from './components/UserHistory';
import { AppState, User, InterviewSession, Answer } from './types';
import { generateQuestions, generateFeedback, calculateOverallScore } from './utils';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentScreen: 'landing',
    user: null,
    showAuthModal: false,
    authMode: 'signup',
    onboardingStep: 1,
    jobDetails: {
      role: '',
      company: '',
      jobDescription: ''
    },
    resumeFile: null,
    technicalSetup: {
      cameraEnabled: false,
      micEnabled: false,
      cameraPermission: 'pending',
      micPermission: 'pending'
    },
    currentSession: null,
    showCompletionModal: false
  });

  const [colorTheme, setColorTheme] = useState('blue');

  // ---- INTERVIEW HISTORY STATE ----
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);

  // ----------- HANDLERS ------------

  const handleAuthenticate = (email: string, name: string) => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name
    };
    setAppState(prev => ({
      ...prev,
      user,
      showAuthModal: false,
      currentScreen: 'onboarding'
    }));
  };

  const handleOnboardingComplete = () => {
    setAppState(prev => ({
      ...prev,
      currentScreen: 'summary'
    }));
  };

  const handleStartInterview = () => {
    const questions = generateQuestions(appState.jobDetails.role, appState.jobDetails.company);
    const session: InterviewSession = {
      id: Math.random().toString(36).substr(2, 9),
      userId: appState.user!.id,
      jobDetails: appState.jobDetails,
      resumeFile: appState.resumeFile,
      questions,
      answers: [],
      score: 0,
      duration: 0
    };

    setAppState(prev => ({
      ...prev,
      currentSession: session,
      currentScreen: 'live-session'
    }));
  };

  const handleSubmitAnswer = (questionId: string, answerText: string) => {
    if (!appState.currentSession) return;

    const question = appState.currentSession.questions.find(q => q.id === questionId);
    if (!question) return;

    const { score, feedback } = generateFeedback(answerText, question);
    const answer: Answer = {
      questionId,
      text: answerText,
      score,
      feedback,
      timestamp: Date.now()
    };

    const updatedAnswers = [...appState.currentSession.answers, answer];
    const updatedSession = {
      ...appState.currentSession,
      answers: updatedAnswers,
      score: calculateOverallScore(updatedAnswers)
    };

    setAppState(prev => ({
      ...prev,
      currentSession: updatedSession
    }));
  };

  // --- MAIN HISTORY UPDATE LOGIC ---
  const handleCompleteInterview = () => {
    if (!appState.currentSession) return;

    const completedSession = {
      ...appState.currentSession,
      completedAt: new Date(),
      duration: Math.floor(Math.random() * 1800) + 600 // 10-40 minutes
    };

    setInterviewHistory(prev => [...prev, completedSession]);

    setAppState(prev => ({
      ...prev,
      currentSession: completedSession,
      showCompletionModal: true
    }));
  };

  const handleViewReport = () => {
    setAppState(prev => ({
      ...prev,
      showCompletionModal: false,
      currentScreen: 'report'
    }));
  };

  const handleRetakeInterview = () => {
    setAppState(prev => ({
      ...prev,
      showCompletionModal: false,
      currentScreen: 'onboarding'
    }));
  };

  const handleBackToDashboard = () => {
    setAppState(prev => ({
      ...prev,
      currentScreen: 'landing'
    }));
  };

  const handleLeaveSession = () => {
    setAppState(prev => ({
      ...prev,
      currentScreen: 'landing',
      currentSession: null
    }));
  };

  const handleEditSetup = () => {
    setAppState(prev => ({
      ...prev,
      currentScreen: 'onboarding'
    }));
  };

  const handleNavigateUserHistory = () => {
    setAppState(prev => ({
      ...prev,
      currentScreen: 'user-history'
    }));
  };

  // ---- USER HISTORY ADAPTER ----
  // Converts InterviewSession[] to array for UserHistory
  const interviews = interviewHistory.map(s => ({
    id: s.id,
    date: s.completedAt ? new Date(s.completedAt).toLocaleDateString() : '—',
    time: s.completedAt ? new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    role: s.jobDetails.role,
    company: s.jobDetails.company,
    score: s.score,
    status: 'Completed'
  }));

  // ---- RENDER LOGIC ----
  const renderCurrentScreen = () => {
    switch (appState.currentScreen) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={() => setAppState(prev => ({ ...prev, showAuthModal: true, authMode: 'signup' }))}
            onSignIn={() => setAppState(prev => ({ ...prev, showAuthModal: true, authMode: 'signin' }))}
            onOpenUserHistory={handleNavigateUserHistory}
          />
        );
      case 'onboarding':
        return (
          <OnboardingPage
            jobDetails={appState.jobDetails}
            onJobDetailsChange={jobDetails => setAppState(prev => ({ ...prev, jobDetails }))}
            resumeFile={appState.resumeFile}
            onResumeUpload={file => setAppState(prev => ({ ...prev, resumeFile: file }))}
            technicalSetup={appState.technicalSetup}
            onTechnicalSetupChange={setup => setAppState(prev => ({ ...prev, technicalSetup: setup }))}
            onContinue={handleOnboardingComplete}
          />
        );
      case 'summary':
        return (
          <InterviewSummary
            jobDetails={appState.jobDetails}
            resumeFile={appState.resumeFile}
            technicalSetup={appState.technicalSetup}
            onEditSetup={handleEditSetup}
            onStartInterview={handleStartInterview}
          />
        );
      case 'live-session':
        return appState.currentSession ? (
          <LiveInterviewSession
            jobDetails={appState.jobDetails}
            questions={appState.currentSession.questions}
            onSubmitAnswer={handleSubmitAnswer}
            onCompleteInterview={handleCompleteInterview}
            onLeaveSession={handleLeaveSession}
          />
        ) : null;
      case 'report':
        return appState.currentSession ? (
          <InterviewReport
            session={appState.currentSession}
            onBack={handleBackToDashboard}
            onDownloadReport={() => alert('Report download would start here')}
            onViewRepository={() => alert('Repository view would open here')}
          />
        ) : null;
      case 'user-history':
        return (
          <UserHistory
            onNavigate={page => {
              if (page === 'landing') handleBackToDashboard();
            }}
            colorTheme={colorTheme}
            onThemeChange={setColorTheme}
            interviews={interviews}   // <<<<<< THIS IS THE WIRE!
          />
        );
      default:
        return null;
    }
  };

  // ---- APP RENDER ----
  return (
    <div className="min-h-screen">
      {renderCurrentScreen()}
      <AuthModal
        isOpen={appState.showAuthModal}
        onClose={() => setAppState(prev => ({ ...prev, showAuthModal: false }))}
        mode={appState.authMode}
        onModeChange={mode => setAppState(prev => ({ ...prev, authMode: mode }))}
        onAuthenticate={handleAuthenticate}
      />
      <CompletionModal
        isOpen={appState.showCompletionModal}
        onViewReport={handleViewReport}
        onRetakeInterview={handleRetakeInterview}
        onClose={() => setAppState(prev => ({ ...prev, showCompletionModal: false }))}
      />
    </div>
  );
}

export default App;
