import { Question, Answer } from './types';

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const generateQuestions = (role: string, company: string): Question[] => {
  const questions: Question[] = [
    {
      id: '1',
      text: `Could you introduce yourself, focusing on your skills, strengths, and career aspirations?`,
      category: 'Behavioral',
      difficulty: 'Easy'
    },
    // {
    //   id: '2',
    //   text: `What makes you a good fit for the ${role} position?`,
    //   category: 'Role Fit',
    //   difficulty: 'Medium'
    // },
    // {
    //   id: '3',
    //   text: 'Describe a challenging project you worked on and how you overcame obstacles.',
    //   category: 'Problem Solving',
    //   difficulty: 'Medium'
    // },
    // {
    //   id: '4',
    //   text: 'How do you handle working under pressure and tight deadlines?',
    //   category: 'Behavioral',
    //   difficulty: 'Easy'
    // },
    // {
    //   id: '5',
    //   text: 'What are your salary expectations for this role?',
    //   category: 'Compensation',
    //   difficulty: 'Hard'
    // }
  ];

  return questions;
};

export const generateFeedback = (answer: string, question: Question): { score: number; feedback: string } => {
  const score = Math.floor(Math.random() * 4) + 7; // Score between 7-10
  const feedbacks = [
    'Great answer! Your response demonstrates strong understanding and experience.',
    'Good response with solid examples. Consider adding more specific details.',
    'Excellent insight! Your answer shows deep knowledge of the subject.',
    'Well articulated answer. You effectively addressed the key points.',
    'Strong response with clear structure and relevant examples.'
  ];
  
  return {
    score,
    feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)]
  };
};

export const calculateOverallScore = (answers: Answer[]): number => {
  if (answers.length === 0) return 0;
  return answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length;
};

export const getRatingLabel = (score: number): { label: string; color: string } => {
  if (score >= 9) return { label: 'Outstanding', color: 'text-emerald-600' };
  if (score >= 8) return { label: 'Strong Hire', color: 'text-green-600' };
  if (score >= 7) return { label: 'Good', color: 'text-blue-600' };
  if (score >= 6) return { label: 'Average', color: 'text-yellow-600' };
  return { label: 'Needs Improvement', color: 'text-red-600' };
};