<script lang="ts">
  import type { Flashcard } from '$lib/types';
  import { showAnswer, flashcardActions } from '$lib/stores/flashcardStore';
  import { cn, getDifficultyIcon } from '$lib/utils.js';

  interface Props {
    flashcard: Flashcard;
    showProgress?: boolean;
    currentIndex?: number;
    totalCards?: number;
  }

  let { flashcard, showProgress = false, currentIndex = 0, totalCards = 0 }: Props = $props();
  
  let isFlipped = $derived($showAnswer);
  let cardStyle = $derived(`transform: ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`);

  function handleCardClick() {
    flashcardActions.toggleAnswer();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  }

  function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'hard': return 'badge-error';
      default: return 'badge-neutral';
    }
  }

  function getDifficultyGradient(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'from-green-400 to-emerald-500';
      case 'medium': return 'from-yellow-400 to-orange-500';
      case 'hard': return 'from-red-400 to-pink-500';
      default: return 'from-purple-400 to-blue-500';
    }
  }
</script>

<div class="flashcard-container w-full max-w-3xl mx-auto">
  {#if showProgress}
    <div class="mb-6">
      <div class="flex justify-between items-center mb-3">
        <span class="text-lg font-semibold flex items-center gap-2">
          <span class="text-xl">📊</span>
          Progress
        </span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">{currentIndex + 1} of {totalCards}</span>
          <div class="badge badge-primary badge-sm">{Math.round(((currentIndex + 1) / totalCards) * 100)}%</div>
        </div>
      </div>
      <progress 
        class="progress progress-primary w-full h-3" 
        value={currentIndex + 1} 
        max={totalCards}
      ></progress>
    </div>
  {/if}

  <div class="flashcard-wrapper perspective-1000">
    <div 
      class={cn(
        "flashcard relative w-full h-96 cursor-pointer transition-all duration-700 preserve-3d group",
        "hover:scale-105 hover:shadow-2xl"
      )}
      style={cardStyle}
      onclick={handleCardClick}
      onkeydown={handleKeydown}
      tabindex="0"
      role="button"
      aria-label={`Flashcard: ${flashcard.question}. Click to ${isFlipped ? 'see question' : 'reveal answer'}`}
    >
      <!-- Front of card (Question) -->
      <div class="flashcard-face flashcard-front absolute inset-0 w-full h-full backface-hidden">
        <div class="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl h-full border border-base-300/50">
          <div class="card-body flex flex-col justify-between h-full p-8">
            <!-- Header with badges -->
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-2">
                <div class={cn("badge", getDifficultyColor(flashcard.difficulty), "badge-lg gap-1")}>
                  <span>{getDifficultyIcon(flashcard.difficulty)}</span>
                  {flashcard.difficulty}
                </div>
              </div>
              {#if flashcard.topic}
                <div class="badge badge-outline badge-lg">
                  📚 {flashcard.topic}
                </div>
              {/if}
            </div>
            
            <!-- Question content -->
            <div class="flex-grow flex items-center justify-center text-center">
              <div class="space-y-4">
                <div class="text-4xl mb-4">❓</div>
                <h2 class="text-2xl font-bold leading-relaxed text-base-content">
                  {flashcard.question}
                </h2>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="text-center">
              <div class="flex items-center justify-center gap-2 text-base-content/60">
                <span class="text-lg">👆</span>
                <p class="text-sm">Click to reveal answer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Back of card (Answer) -->
      <div class="flashcard-face flashcard-back absolute inset-0 w-full h-full backface-hidden rotate-y-180">
        <div class={cn(
          "card shadow-2xl h-full border border-opacity-30",
          `bg-gradient-to-br ${getDifficultyGradient(flashcard.difficulty)} text-white`
        )}>
          <div class="card-body flex flex-col justify-between h-full p-8">
            <!-- Header -->
            <div class="flex justify-between items-start mb-6">
              <div class="badge badge-secondary badge-lg gap-1">
                <span class="text-lg">💡</span>
                Answer
              </div>
              <div class="badge badge-outline badge-lg bg-white/20 border-white/30 text-white">
                {getDifficultyIcon(flashcard.difficulty)} {flashcard.difficulty}
              </div>
            </div>
            
            <!-- Answer content -->
            <div class="flex-grow flex items-center justify-center text-center">
              <div class="space-y-6">
                <!-- Question recap -->
                <div class="bg-black/20 rounded-lg p-4 backdrop-blur-sm">
                  <h3 class="text-lg font-medium opacity-90 mb-2">
                    {flashcard.question}
                  </h3>
                </div>
                
                <div class="text-2xl font-bold">↓</div>
                
                <!-- Answer -->
                <div class="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                  <p class="text-xl leading-relaxed font-medium">
                    {flashcard.answer}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="text-center">
              <div class="flex items-center justify-center gap-2 text-white/80">
                <span class="text-lg">👆</span>
                <p class="text-sm">Click to see question</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Keyboard shortcuts hint -->
  <div class="mt-6 text-center">
    <div class="text-xs text-base-content/50 space-x-4">
      <span>💡 <kbd class="kbd kbd-xs">Space</kbd> or <kbd class="kbd kbd-xs">Enter</kbd> to flip</span>
      <span>⬅️ <kbd class="kbd kbd-xs">←</kbd> Previous</span>
      <span>➡️ <kbd class="kbd kbd-xs">→</kbd> Next</span>
    </div>
  </div>
</div>

<style>
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .preserve-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  
  .flashcard:focus {
    outline: 2px solid hsl(var(--p));
    outline-offset: 4px;
    outline-radius: 1rem;
  }
  
  .flashcard-face {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .flashcard:hover {
    transform: translateY(-4px);
  }

  .group:hover .badge {
    transform: scale(1.05);
  }

  @keyframes flip-in {
    0% { opacity: 0; transform: rotateY(-10deg); }
    100% { opacity: 1; transform: rotateY(0deg); }
  }
  
  .flashcard-face {
    animation: flip-in 0.6s ease-out;
  }
</style> 