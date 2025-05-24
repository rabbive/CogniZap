import { writable, derived } from 'svelte/store';
import type { Quiz, QuizQuestion, QuizResult, UserAnswer } from '../types.js';

// Quiz store
export const currentQuiz = writable<Quiz | null>(null);

// Current question index
export const currentQuestionIndex = writable<number>(0);

// User answers
export const userAnswers = writable<UserAnswer[]>([]);

// Quiz state
export const quizState = writable<'setup' | 'active' | 'completed'>('setup');

// Timer
export const timeRemaining = writable<number>(0); // in seconds
export const quizStartTime = writable<number>(0);

// Derived store for current question
export const currentQuestion = derived(
  [currentQuiz, currentQuestionIndex],
  ([$currentQuiz, $currentQuestionIndex]) => {
    return $currentQuiz?.questions[$currentQuestionIndex] || null;
  }
);

// Derived store for quiz progress
export const quizProgress = derived(
  [currentQuiz, currentQuestionIndex],
  ([$currentQuiz, $currentQuestionIndex]) => {
    const total = $currentQuiz?.questions.length || 0;
    const current = Math.min($currentQuestionIndex + 1, total);
    return {
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0
    };
  }
);

// Derived store for quiz results
export const quizResults = derived(
  [currentQuiz, userAnswers, quizStartTime],
  ([$currentQuiz, $userAnswers, $quizStartTime]) => {
    if (!$currentQuiz || $userAnswers.length === 0) return null;

    const totalQuestions = $currentQuiz.questions.length;
    const correctAnswers = $userAnswers.filter(answer => answer.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeSpent = $quizStartTime > 0 ? Math.floor((Date.now() - $quizStartTime) / 1000) : 0;

    return {
      quizId: $currentQuiz.id,
      score,
      totalQuestions,
      correctAnswers,
      answers: $userAnswers,
      completedAt: new Date(),
      timeSpent
    };
  }
);

// Quiz actions
export const quizActions = {
  startQuiz: (quiz: Quiz) => {
    currentQuiz.set(quiz);
    currentQuestionIndex.set(0);
    userAnswers.set([]);
    quizState.set('active');
    quizStartTime.set(Date.now());
    
    // Set timer if quiz has time limit
    if (quiz.timeLimit) {
      timeRemaining.set(quiz.timeLimit * 60); // convert minutes to seconds
    }
  },

  answerQuestion: (questionId: string, selectedAnswer: number, timeSpent: number) => {
    const question = derived([currentQuiz, currentQuestionIndex], ([$quiz, $index]) => 
      $quiz?.questions[$index]
    );
    
    question.subscribe($question => {
      if ($question) {
        const isCorrect = selectedAnswer === $question.correctAnswer;
        const answer: UserAnswer = {
          questionId,
          selectedAnswer,
          isCorrect,
          timeSpent
        };
        
        userAnswers.update(answers => [...answers, answer]);
      }
    })();
  },

  nextQuestion: () => {
    currentQuestionIndex.update(index => {
      const newIndex = index + 1;
      currentQuiz.subscribe(quiz => {
        if (quiz && newIndex >= quiz.questions.length) {
          quizState.set('completed');
        }
      })();
      return newIndex;
    });
  },

  previousQuestion: () => {
    currentQuestionIndex.update(index => Math.max(0, index - 1));
  },

  goToQuestion: (index: number) => {
    currentQuestionIndex.set(index);
  },

  completeQuiz: () => {
    quizState.set('completed');
  },

  resetQuiz: () => {
    currentQuiz.set(null);
    currentQuestionIndex.set(0);
    userAnswers.set([]);
    quizState.set('setup');
    timeRemaining.set(0);
    quizStartTime.set(0);
  },

  updateTimer: () => {
    timeRemaining.update(time => {
      const newTime = Math.max(0, time - 1);
      if (newTime === 0) {
        quizState.set('completed');
      }
      return newTime;
    });
  }
}; 