export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  createdAt: Date;
  // Enhanced features
  sources?: Source[];
  lastUpdated?: Date;
  trendingnessScore?: number;
  relatedCurrentTopics?: string[];
  factCheckStatus?: 'verified' | 'pending' | 'disputed';
  confidenceScore?: number; // 0-100
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  topic?: string;
  timeLimit?: number; // in minutes
  createdAt: Date;
  // Enhanced features
  sources?: Source[];
  lastUpdated?: Date;
  trendingnessScore?: number;
  isCurrentEvents?: boolean;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
  // Enhanced features
  sources?: Source[];
  factCheckStatus?: 'verified' | 'pending' | 'disputed';
  confidenceScore?: number;
  relatedTopics?: string[];
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

// New enhanced types
export interface Source {
  url: string;
  title: string;
  publishedDate: Date;
  reliability: number; // 0-100
  domain: string;
  snippet?: string;
}

export interface StudyPreferences {
  includeCurrentEvents: boolean;
  sourceRecency: 'day' | 'week' | 'month' | 'any';
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
  industryFocus: string[];
  factCheckLevel: 'basic' | 'thorough' | 'academic';
  autoRefresh: boolean;
  trendingnessThreshold: number; // 0-100
}

export interface TrendingTopic {
  topic: string;
  score: number;
  category: string;
  relatedKeywords: string[];
  lastUpdated: Date;
  sources: Source[];
}

export interface NewsBasedContent {
  id: string;
  headline: string;
  summary: string;
  category: 'technology' | 'science' | 'politics' | 'business' | 'health' | 'education';
  publishedDate: Date;
  sources: Source[];
  generatedContent: Flashcard[] | Quiz;
}

export interface EnhancedGenerateRequest extends GenerateRequest {
  preferences?: StudyPreferences;
  includeCurrentEvents?: boolean;
  factCheck?: boolean;
  includeSources?: boolean;
  targetAudience?: 'student' | 'professional' | 'researcher';
  contentFreshness?: 'latest' | 'recent' | 'any';
}

export interface EnhancedGenerateResponse extends GenerateResponse {
  sources?: Source[];
  trendingnessScore?: number;
  factCheckResults?: FactCheckResult[];
  relatedTopics?: string[];
  lastUpdated?: Date;
  contentFreshness?: string;
}

export interface FactCheckResult {
  claim: string;
  status: 'verified' | 'disputed' | 'unverified';
  confidence: number;
  sources: Source[];
  explanation: string;
}

export interface LiveDataIntegration {
  type: 'stock' | 'weather' | 'sports' | 'news' | 'research';
  apiEndpoint: string;
  lastFetched: Date;
  data: any;
  reliability: number;
}

export interface LearningAnalytics {
  userId?: string;
  topicPopularity: { [topic: string]: number };
  learningProgress: { [topic: string]: number };
  trendsFollowed: string[];
  factCheckAccuracy: number;
  lastActive: Date;
} 