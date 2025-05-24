<script lang="ts">
  import type { Quiz, QuizQuestion } from '$lib/types';
  import { 
    currentQuestion, 
    quizProgress, 
    quizState, 
    timeRemaining, 
    quizActions,
    userAnswers
  } from '$lib/stores/quizStore';
  import { onMount, onDestroy } from 'svelte';
  import { cn, formatTime } from '$lib/utils.js';

  interface Props {
    quiz: Quiz;
  }

  let { quiz }: Props = $props();
  
  let selectedAnswer = $state(-1);
  let questionStartTime = $state(0);
  let timerInterval: NodeJS.Timeout | null = null;
  let showExplanation = $state(false);
  let hasAnswered = $state(false);

  let currentQ = $derived($currentQuestion);
  let progress = $derived($quizProgress);
  let quizCurrentState = $derived($quizState);
  let timeLeft = $derived($timeRemaining);
  let answers = $derived($userAnswers);

  // Format time display
  let timeDisplay = $derived(() => formatTime(timeLeft));

  onMount(() => {
    quizActions.startQuiz(quiz);
    questionStartTime = Date.now();
    
    // Start timer if quiz has time limit
    if (quiz.timeLimit) {
      timerInterval = setInterval(() => {
        quizActions.updateTimer();
      }, 1000);
    }
  });

  onDestroy(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  });

  function selectAnswer(index: number) {
    if (hasAnswered) return;
    
    selectedAnswer = index;
    hasAnswered = true;
    
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    if (currentQ) {
      quizActions.answerQuestion(currentQ.id, index, timeSpent);
      
      // Show explanation after a short delay
      setTimeout(() => {
        showExplanation = true;
      }, 500);
    }
  }

  function nextQuestion() {
    // Reset state for next question
    selectedAnswer = -1;
    hasAnswered = false;
    showExplanation = false;
    questionStartTime = Date.now();
    
    quizActions.nextQuestion();
  }

  function previousQuestion() {
    quizActions.previousQuestion();
    selectedAnswer = -1;
    hasAnswered = false;
    showExplanation = false;
    questionStartTime = Date.now();
  }

  function completeQuiz() {
    quizActions.completeQuiz();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }

  function getOptionClass(index: number): string {
    if (!hasAnswered) {
      return selectedAnswer === index ? 'btn-primary' : 'btn-outline';
    }
    
    if (currentQ && index === currentQ.correctAnswer) {
      return 'btn-success';
    } else if (selectedAnswer === index && index !== currentQ?.correctAnswer) {
      return 'btn-error';
    } else {
      return 'btn-outline opacity-50';
    }
  }

  function getOptionIcon(index: number): string {
    if (!hasAnswered) {
      return selectedAnswer === index ? '🔵' : '⚪';
    }
    
    if (currentQ && index === currentQ.correctAnswer) {
      return '✅';
    } else if (selectedAnswer === index && index !== currentQ?.correctAnswer) {
      return '❌';
    } else {
      return '⚪';
    }
  }
</script>

{#if quizCurrentState === 'active' && currentQ}
  <div class="quiz-container w-full max-w-5xl mx-auto">
    <!-- Header -->
    <div class="bg-gradient-to-r from-base-200 to-base-300 rounded-2xl p-8 mb-8 shadow-xl border border-base-300/50">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
          <span class="text-4xl">🧠</span>
          {quiz.title}
        </h1>
        {#if quiz.timeLimit}
          <div class={cn(
            "badge badge-lg p-4 gap-2 text-lg font-bold",
            timeLeft < 300 ? 'badge-warning animate-pulse' : 'badge-info'
          )}>
            <span class="text-xl">⏱️</span>
            {timeDisplay}
          </div>
        {/if}
      </div>
      
      <!-- Progress -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold flex items-center gap-2">
            <span class="text-xl">📊</span>
            Question {progress.current} of {progress.total}
          </span>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{progress.percentage}% Complete</span>
            <div class="badge badge-primary badge-sm">{progress.percentage}%</div>
          </div>
        </div>
        <progress 
          class="progress progress-primary w-full h-4" 
          value={progress.current} 
          max={progress.total}
        ></progress>
      </div>
    </div>

    <!-- Question -->
    <div class="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl mb-8 border border-base-300/50">
      <div class="card-body p-8">
        <div class="flex items-start gap-4 mb-8">
          <div class="text-4xl">❓</div>
          <h2 class="card-title text-2xl leading-relaxed flex-1">
            {currentQ.question}
          </h2>
        </div>
        
        <!-- Options -->
        <div class="space-y-4">
          {#each currentQ.options as option, index}
            <button
              class={cn(
                "btn w-full justify-start text-left h-auto min-h-16 p-6 transition-all duration-300",
                getOptionClass(index),
                hasAnswered ? '' : 'hover:scale-[1.02] hover:shadow-lg'
              )}
              onclick={() => selectAnswer(index)}
              disabled={hasAnswered}
            >
              <span class="flex items-center gap-4 w-full">
                <div class="flex items-center gap-3">
                  <span class="text-xl">{getOptionIcon(index)}</span>
                  <span class="badge badge-outline text-lg px-3 py-2">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
                <span class="flex-1 text-wrap text-lg leading-relaxed">{option}</span>
                {#if hasAnswered && index === currentQ.correctAnswer}
                  <span class="text-2xl">🎉</span>
                {:else if hasAnswered && selectedAnswer === index && index !== currentQ.correctAnswer}
                  <span class="text-2xl">😔</span>
                {/if}
              </span>
            </button>
          {/each}
        </div>

        <!-- Explanation -->
        {#if showExplanation && currentQ.explanation}
          <div class="alert bg-gradient-to-r from-info/10 to-primary/10 border border-info/30 mt-8 p-6">
            <div class="flex gap-4">
              <span class="text-2xl">💡</span>
              <div class="flex-1">
                <h4 class="font-bold text-lg mb-2 flex items-center gap-2">
                  <span>Explanation</span>
                  {#if selectedAnswer === currentQ.correctAnswer}
                    <span class="text-xl">🎯</span>
                  {:else}
                    <span class="text-xl">📚</span>
                  {/if}
                </h4>
                <p class="text-base leading-relaxed">{currentQ.explanation}</p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between items-center">
      <button 
        class={cn(
          "btn btn-outline btn-lg gap-2",
          progress.current === 1 ? 'btn-disabled' : 'hover:btn-primary'
        )}
        onclick={previousQuestion}
        disabled={progress.current === 1}
      >
        <span class="text-xl">⬅️</span>
        Previous
      </button>
      
      <div class="flex gap-4">
        {#if progress.current === progress.total}
          <button 
            class={cn(
              "btn btn-success btn-lg gap-2 px-8",
              !hasAnswered ? 'btn-disabled' : 'hover:scale-105 shadow-lg'
            )}
            onclick={completeQuiz}
            disabled={!hasAnswered}
          >
            <span class="text-xl">🎉</span>
            Complete Quiz
          </button>
        {:else}
          <button 
            class={cn(
              "btn btn-primary btn-lg gap-2 px-8",
              !hasAnswered ? 'btn-disabled' : 'hover:scale-105 shadow-lg'
            )}
            onclick={nextQuestion}
            disabled={!hasAnswered}
          >
            Next
            <span class="text-xl">➡️</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Keyboard shortcuts hint -->
    <div class="mt-8 text-center">
      <div class="text-xs text-base-content/50 space-x-4">
        <span>💡 Use number keys <kbd class="kbd kbd-xs">1</kbd>-<kbd class="kbd kbd-xs">4</kbd> to select answers</span>
        <span>⬅️ <kbd class="kbd kbd-xs">←</kbd> Previous</span>
        <span>➡️ <kbd class="kbd kbd-xs">→</kbd> Next</span>
      </div>
    </div>
  </div>
{:else if quizCurrentState === 'completed'}
  <div class="text-center max-w-2xl mx-auto">
    <div class="alert alert-success mb-8 p-8 shadow-2xl">
      <div class="flex flex-col items-center gap-4">
        <span class="text-6xl">🎊</span>
        <div>
          <h3 class="font-bold text-2xl mb-2">Quiz Completed!</h3>
          <div class="text-lg">You've finished all questions</div>
        </div>
      </div>
    </div>
    
    <button 
      class="btn btn-primary btn-lg gap-2 px-8 hover:scale-105 shadow-lg"
      onclick={() => window.location.href = '/results'}
    >
      <span class="text-xl">📊</span>
      View Results
    </button>
  </div>
{/if} 