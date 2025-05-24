export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  createdAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  topic?: string;
  timeLimit?: number; // in minutes
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  completedAt: Date;
  timeSpent: number; // in seconds
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface GenerateRequest {
  topic: string;
  type: 'flashcards' | 'quiz';
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface GenerateResponse {
  success: boolean;
  data?: Flashcard[] | Quiz;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  text?: string;
  filename?: string;
  fileSize?: number;
  error?: string;
}

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: PerplexityMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 