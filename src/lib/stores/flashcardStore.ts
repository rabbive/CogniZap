import { writable, derived } from 'svelte/store';
import type { Flashcard } from '../types.js';

// Flashcards store
export const flashcards = writable<Flashcard[]>([]);

// Current flashcard index
export const currentFlashcardIndex = writable<number>(0);

// Show answer state
export const showAnswer = writable<boolean>(false);

// Study mode (random, sequential)
export const studyMode = writable<'sequential' | 'random'>('sequential');

// Derived store for current flashcard
export const currentFlashcard = derived(
  [flashcards, currentFlashcardIndex],
  ([$flashcards, $currentFlashcardIndex]) => {
    return $flashcards[$currentFlashcardIndex] || null;
  }
);

// Derived store for progress
export const studyProgress = derived(
  [flashcards, currentFlashcardIndex],
  ([$flashcards, $currentFlashcardIndex]) => {
    const total = $flashcards.length;
    const current = Math.min($currentFlashcardIndex + 1, total);
    return {
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0
    };
  }
);

// Store functions
export const flashcardActions = {
  setFlashcards: (newFlashcards: Flashcard[]) => {
    flashcards.set(newFlashcards);
    currentFlashcardIndex.set(0);
    showAnswer.set(false);
  },

  nextCard: () => {
    currentFlashcardIndex.update(index => {
      let newIndex = index + 1;
      flashcards.subscribe(cards => {
        if (newIndex >= cards.length) {
          newIndex = 0; // Loop back to start
        }
      })();
      return newIndex;
    });
    showAnswer.set(false);
  },

  previousCard: () => {
    currentFlashcardIndex.update(index => {
      let newIndex = index - 1;
      if (newIndex < 0) {
        flashcards.subscribe(cards => {
          newIndex = cards.length - 1; // Go to last card
        })();
      }
      return newIndex;
    });
    showAnswer.set(false);
  },

  goToCard: (index: number) => {
    currentFlashcardIndex.set(index);
    showAnswer.set(false);
  },

  toggleAnswer: () => {
    showAnswer.update(show => !show);
  },

  shuffleCards: () => {
    flashcards.update(cards => {
      const shuffled = [...cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    currentFlashcardIndex.set(0);
    showAnswer.set(false);
  },

  reset: () => {
    flashcards.set([]);
    currentFlashcardIndex.set(0);
    showAnswer.set(false);
  }
}; 