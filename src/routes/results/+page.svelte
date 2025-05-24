<script lang="ts">
  import { goto } from '$app/navigation';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import { 
    flashcards, 
    currentFlashcard, 
    studyProgress, 
    flashcardActions 
  } from '$lib/stores/flashcardStore';
  import { 
    currentQuiz, 
    quizState, 
    quizResults 
  } from '$lib/stores/quizStore';
  import { cn } from '$lib/utils.js';

  let cards = $derived($flashcards);
  let currentCard = $derived($currentFlashcard);
  let progress = $derived($studyProgress);
  let quiz = $derived($currentQuiz);
  let quizCurrentState = $derived($quizState);
  let results = $derived($quizResults);

  function handleStartOver() {
    flashcardActions.reset();
    goto('/');
  }

  function handleNewContent() {
    flashcardActions.reset();
    goto('/');
  }

  function handleNextCard() {
    flashcardActions.nextCard();
  }

  function handlePreviousCard() {
    flashcardActions.previousCard();
  }

  function handleShuffle() {
    flashcardActions.shuffleCards();
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (cards.length > 0) {
      switch(event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousCard();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextCard();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          flashcardActions.toggleAnswer();
          break;
      }
    }
  }
</script>

<svelte:head>
  <title>Results - CogniZap</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10">
  <div class="container mx-auto px-4 py-8">
    <!-- Navigation -->
    <div class="mb-8">
      <div class="breadcrumbs text-lg">
        <ul>
          <li>
            <a href="/" class="link link-hover flex items-center gap-2">
              <span class="text-xl">🏠</span>
              Home
            </a>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-xl">📊</span>
            Results
          </li>
        </ul>
      </div>
    </div>

    {#if quiz && quizCurrentState !== 'setup'}
      <!-- Quiz Mode -->
      {#if quizCurrentState === 'completed' && results}
        <!-- Quiz Results -->
        <div class="max-w-5xl mx-auto text-center">
          <div class="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300/50">
            <div class="card-body p-12">
              <div class="text-8xl mb-6">🎉</div>
              <h1 class="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-8">
                Quiz Complete!
              </h1>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div class="stat bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl p-8 border border-primary/20">
                  <div class="stat-figure text-6xl">🎯</div>
                  <div class="stat-title text-lg font-semibold">Your Score</div>
                  <div class="stat-value text-5xl font-bold text-primary">{results.score}%</div>
                  <div class="stat-desc text-lg">
                    {results.correctAnswers} out of {results.totalQuestions} correct
                    {#if results.score >= 90}
                      <div class="text-success font-semibold mt-2">🌟 Excellent!</div>
                    {:else if results.score >= 70}
                      <div class="text-warning font-semibold mt-2">👍 Good job!</div>
                    {:else}
                      <div class="text-info font-semibold mt-2">📚 Keep studying!</div>
                    {/if}
                  </div>
                </div>
                
                <div class="stat bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl p-8 border border-secondary/20">
                  <div class="stat-figure text-6xl">⏱️</div>
                  <div class="stat-title text-lg font-semibold">Time Spent</div>
                  <div class="stat-value text-5xl font-bold text-secondary">
                    {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
                  </div>
                  <div class="stat-desc text-lg">
                    Average: {Math.round(results.timeSpent / results.totalQuestions)}s per question
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-4 justify-center">
                <button 
                  class="btn btn-primary btn-lg gap-2 px-8 hover:scale-105 shadow-lg transition-all duration-300"
                  onclick={handleNewContent}
                >
                  <span class="text-xl">⚡</span>
                  Create New Content
                </button>
                <button 
                  class="btn btn-outline btn-lg gap-2 px-6 hover:btn-secondary transition-all duration-300"
                  onclick={() => window.location.reload()}
                >
                  <span class="text-xl">🔄</span>
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      {:else}
        <!-- Active Quiz -->
        <Quiz {quiz} />
      {/if}
    {:else if cards.length > 0}
      <!-- Flashcard Mode -->
      <div class="max-w-6xl mx-auto">
        <!-- Controls -->
        <div class="card bg-gradient-to-r from-base-200 to-base-300 shadow-xl mb-8 border border-base-300/50">
          <div class="card-body p-6">
            <div class="flex flex-wrap justify-between items-center gap-6">
              <div class="flex items-center gap-6">
                <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                  <span class="text-4xl">📚</span>
                  Flashcards
                </h1>
                <div class="flex items-center gap-3">
                  <div class="badge badge-primary badge-lg text-lg px-4 py-3">
                    {progress.current} / {progress.total}
                  </div>
                  <div class="badge badge-secondary badge-lg text-lg px-4 py-3">
                    {progress.percentage}%
                  </div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button 
                  class="btn btn-outline btn-lg gap-2 hover:btn-accent transition-all duration-300"
                  onclick={handleShuffle}
                  title="Shuffle cards"
                >
                  <span class="text-xl">🔀</span>
                  Shuffle
                </button>
                <button 
                  class={cn(
                    "btn btn-outline btn-lg gap-2 transition-all duration-300",
                    progress.current === 1 ? 'btn-disabled' : 'hover:btn-primary'
                  )}
                  onclick={handlePreviousCard}
                  disabled={progress.current === 1}
                >
                  <span class="text-xl">⬅️</span>
                  Previous
                </button>
                <button 
                  class="btn btn-primary btn-lg gap-2 hover:scale-105 shadow-lg transition-all duration-300"
                  onclick={handleNextCard}
                >
                  Next
                  <span class="text-xl">➡️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Flashcard Display -->
        {#if currentCard}
          <Flashcard 
            flashcard={currentCard}
            showProgress={true}
            currentIndex={progress.current - 1}
            totalCards={progress.total}
          />
        {/if}

        <!-- Navigation and Actions -->
        <div class="flex flex-wrap justify-center gap-6 mt-12">
          <button 
            class="btn btn-outline btn-lg gap-2 hover:btn-secondary transition-all duration-300"
            onclick={handleStartOver}
          >
            <span class="text-xl">🏠</span>
            Home
          </button>
          <button 
            class="btn btn-primary btn-lg gap-2 px-8 hover:scale-105 shadow-lg transition-all duration-300"
            onclick={handleNewContent}
          >
            <span class="text-xl">⚡</span>
            Create New
          </button>
        </div>
      </div>
    {:else}
      <!-- No Content -->
      <div class="max-w-3xl mx-auto text-center">
        <div class="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300/50">
          <div class="card-body p-16">
            <div class="text-8xl mb-8">🤔</div>
            <h1 class="text-4xl font-bold mb-6 text-base-content">No Content Found</h1>
            <p class="text-xl text-base-content/70 mb-12 leading-relaxed">
              It looks like you haven't generated any flashcards or quizzes yet.
              Let's create some amazing study content!
            </p>
            <button 
              class="btn btn-primary btn-lg gap-2 px-8 hover:scale-105 shadow-lg transition-all duration-300"
              onclick={() => goto('/')}
            >
              <span class="text-xl">⚡</span>
              Generate Content
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div> 