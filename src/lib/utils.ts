import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getGradientByDifficulty(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'from-green-400 to-blue-500';
    case 'medium':
      return 'from-yellow-400 to-orange-500';
    case 'hard':
      return 'from-red-400 to-pink-500';
    default:
      return 'from-purple-400 to-blue-500';
  }
}

export function getDifficultyIcon(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '🟢';
    case 'medium':
      return '🟡';
    case 'hard':
      return '🔴';
    default:
      return '🟣';
  }
} 