<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';

  // Game state
  let gameData = $state<any>(null);
  let gameType = $state<'flashcards' | 'quiz'>('flashcards');
  let currentIndex = $state(0);
  let isLoading = $state(true);
  let gameStarted = $state(false);
  let gameCompleted = $state(false);
  let showAnswer = $state(false);
  
  // Timer state
  let timeLeft = $state(30);
  let totalTime = $state(30);
  let timerInterval: any = null;
  let customTimerEnabled = $state(false);
  let timerOptions = $state([5, 10, 15, 20, 30, 45, 60]);
  let selectedTimer = $state(30);
  let showTimerSettings = $state(false);
  
  // Quiz specific state
  let selectedAnswer = $state<number | null>(null);
  let isCorrect = $state<boolean | null>(null);
  let score = $state(0);
  let answers = $state<boolean[]>([]);
  let showCelebration = $state(false);
  let streak = $state(0);
  let longestStreak = $state(0);
  
  // Flashcard specific state
  let cardsReviewed = $state(0);
  let confidence = $state<('easy' | 'medium' | 'hard' | null)[]>([]);

  onMount(() => {
    // Get data from URL params
    const dataParam = $page.url.searchParams.get('data');
    if (!dataParam) {
      goto('/dashboard');
      return;
    }

    try {
      const parsedData = JSON.parse(decodeURIComponent(dataParam));
      gameData = parsedData.data;
      
      // Determine game type
      if (Array.isArray(gameData)) {
        gameType = 'flashcards';
        totalTime = 60; // 1 minute per flashcard
      } else if (gameData.questions) {
        gameType = 'quiz';
        totalTime = 30; // 30 seconds per question
        answers = new Array(gameData.questions.length).fill(false);
      }
      
      selectedTimer = totalTime;
      timeLeft = totalTime;
      isLoading = false;
    } catch (error) {
      console.error('Error parsing game data:', error);
      goto('/dashboard');
    }
  });

  function startGame() {
    if (customTimerEnabled) {
      totalTime = selectedTimer;
      timeLeft = selectedTimer;
    }
    gameStarted = true;
    startTimer();
  }

  function toggleTimerSettings() {
    showTimerSettings = !showTimerSettings;
  }

  function setCustomTimer(seconds: number) {
    selectedTimer = seconds;
    customTimerEnabled = true;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        handleTimeUp();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function handleTimeUp() {
    stopTimer();
    if (gameType === 'quiz') {
      handleQuizNext();
    } else {
      handleFlashcardNext();
    }
  }

  function handleQuizAnswer(answerIndex: number) {
    if (selectedAnswer !== null) return; // Already answered
    
    stopTimer();
    selectedAnswer = answerIndex;
    isCorrect = answerIndex === getCurrentQuestion().correctAnswer;
    
    if (isCorrect) {
      score++;
      answers[currentIndex] = true;
      streak++;
      longestStreak = Math.max(longestStreak, streak);
      
      // Show celebration for correct answers
      if (streak >= 3) {
        showCelebration = true;
        setTimeout(() => showCelebration = false, 1500);
      }
    } else {
      streak = 0;
    }

    // Show result for 2 seconds, then continue
    setTimeout(() => {
      handleQuizNext();
    }, 2000);
  }

  function handleQuizNext() {
    selectedAnswer = null;
    isCorrect = null;
    
    if (currentIndex < gameData.questions.length - 1) {
      currentIndex++;
      timeLeft = totalTime;
      startTimer();
    } else {
      completeGame();
    }
  }

  function handleFlashcardReveal() {
    stopTimer();
    showAnswer = true;
  }

  function handleFlashcardConfidence(level: 'easy' | 'medium' | 'hard') {
    confidence[currentIndex] = level;
    cardsReviewed++;
    handleFlashcardNext();
  }

  function handleFlashcardNext() {
    showAnswer = false;
    
    if (currentIndex < gameData.length - 1) {
      currentIndex++;
      timeLeft = totalTime;
      startTimer();
    } else {
      completeGame();
    }
  }

  function completeGame() {
    stopTimer();
    gameCompleted = true;
  }

  function restartGame() {
    currentIndex = 0;
    gameStarted = false;
    gameCompleted = false;
    showAnswer = false;
    selectedAnswer = null;
    isCorrect = null;
    score = 0;
    cardsReviewed = 0;
    streak = 0;
    longestStreak = 0;
    showCelebration = false;
    timeLeft = totalTime;
    answers = new Array(gameData?.questions?.length || gameData?.length || 0).fill(false);
    confidence = [];
  }

  function getCurrentQuestion() {
    return gameData.questions[currentIndex];
  }

  function getCurrentFlashcard() {
    return gameData[currentIndex];
  }

  function getTimerColor() {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 20) return 'text-yellow-500';
    return 'text-red-500';
  }

  function getProgressPercentage() {
    const total = gameType === 'quiz' ? gameData.questions.length : gameData.length;
    return ((currentIndex + 1) / total) * 100;
  }
</script>

<svelte:head>
  <title>Play - CogniZap</title>
</svelte:head>

{#if isLoading}
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
    <div class="text-center text-white">
      <Icon name="loader" size={48} className="animate-spin mx-auto mb-4" />
      <p class="text-xl">Loading your game...</p>
    </div>
  </div>
{:else if !gameStarted}
  <!-- Game Start Screen -->
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
    <Card class="p-8 max-w-md w-full mx-4 text-center bg-white/95 backdrop-blur">
      <div class="space-y-6">
        <div class="space-y-2">
          <Icon name={gameType === 'quiz' ? 'help-circle' : 'bookmark'} size={48} className="text-purple-500 mx-auto" />
          <h1 class="text-3xl font-bold text-gray-800">
            {gameType === 'quiz' ? 'Quiz Time!' : 'Flashcard Review!'}
          </h1>
          <p class="text-gray-600">
            {gameType === 'quiz' 
              ? `${gameData.questions.length} questions • ${totalTime}s each`
              : `${gameData.length} flashcards • ${totalTime}s each`
            }
          </p>
        </div>

        {#if gameType === 'quiz'}
          <div class="bg-purple-50 p-4 rounded-lg">
            <h3 class="font-semibold text-purple-800 mb-2">{gameData.title}</h3>
            <p class="text-sm text-purple-600">{gameData.description}</p>
          </div>
        {/if}

        <div class="space-y-4">
          <!-- Timer Settings -->
          <div class="bg-gray-50 p-4 rounded-lg space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-700">⏱️ Timer Settings</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onclick={toggleTimerSettings}
                class="text-xs"
              >
                {showTimerSettings ? 'Hide' : 'Customize'}
              </Button>
            </div>
            
            {#if showTimerSettings}
              <div class="space-y-3">
                <div class="grid grid-cols-4 gap-2">
                  {#each timerOptions as option}
                    <Button
                      variant={selectedTimer === option ? 'default' : 'outline'}
                      size="sm"
                      class="text-xs {selectedTimer === option ? 'bg-purple-500 hover:bg-purple-600' : ''}"
                      onclick={() => setCustomTimer(option)}
                    >
                      {option}s
                    </Button>
                  {/each}
                </div>
                <div class="text-xs text-gray-500 text-center">
                  {customTimerEnabled ? `Custom: ${selectedTimer}s per question` : `Default: ${totalTime}s per question`}
                </div>
              </div>
            {:else}
              <div class="text-sm text-gray-600 text-center">
                ⏰ {customTimerEnabled ? selectedTimer : totalTime} seconds per {gameType === 'quiz' ? 'question' : 'card'}
              </div>
            {/if}
          </div>

          <div class="text-sm text-gray-500 space-y-1">
            <p>• Answer quickly to score more points</p>
            <p>• Timer will auto-advance questions</p>
            <p>• Stay focused and have fun!</p>
          </div>
          
          <Button 
            class="w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onclick={startGame}
          >
            <Icon name="play" size={20} className="mr-2" />
            Start Game!
          </Button>
        </div>
      </div>
    </Card>
  </div>
{:else if gameCompleted}
  <!-- Game Complete Screen -->
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-blue-500 to-purple-500">
    <Card class="p-8 max-w-md w-full mx-4 text-center bg-white/95 backdrop-blur">
      <div class="space-y-6">
        <div class="space-y-2">
          <Icon name="trophy" size={48} className="text-yellow-500 mx-auto" />
          <h1 class="text-3xl font-bold text-gray-800">Game Complete!</h1>
        </div>

        {#if gameType === 'quiz'}
          <div class="space-y-4">
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-green-600">{score}/{gameData.questions.length}</div>
              <div class="text-sm text-green-700">Final Score</div>
            </div>
            <div class="text-lg font-semibold text-gray-700">
              {score === gameData.questions.length ? '🎉 Perfect Score!' :
               score >= gameData.questions.length * 0.8 ? '🌟 Excellent!' :
               score >= gameData.questions.length * 0.6 ? '👍 Good Job!' :
               '💪 Keep Practicing!'}
            </div>
            
            {#if longestStreak > 1}
              <div class="bg-yellow-50 p-3 rounded-lg">
                <div class="text-sm text-yellow-800">🔥 Longest Streak: {longestStreak} questions</div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-3xl font-bold text-blue-600">{cardsReviewed}/{gameData.length}</div>
              <div class="text-sm text-blue-700">Cards Reviewed</div>
            </div>
          </div>
        {/if}

        <div class="flex gap-3">
          <Button variant="outline" class="flex-1" onclick={() => goto('/dashboard')}>
            <Icon name="home" size={16} className="mr-2" />
            Dashboard
          </Button>
          <Button class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500" onclick={restartGame}>
            <Icon name="refresh-cw" size={16} className="mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </Card>
  </div>
{:else}
  <!-- Game Play Screen -->
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <!-- Header with timer and progress -->
    <div class="p-4 bg-white/10 backdrop-blur">
      <div class="max-w-4xl mx-auto flex items-center justify-between text-white">
        <div class="flex items-center gap-4">
          <div class="text-sm font-medium">
            Question {currentIndex + 1} of {gameType === 'quiz' ? gameData.questions.length : gameData.length}
          </div>
          {#if gameType === 'quiz'}
            <div class="text-sm">Score: {score}</div>
            {#if streak > 0}
              <div class="text-sm text-yellow-300">🔥 Streak: {streak}</div>
            {/if}
          {/if}
        </div>
        
        <div class="flex items-center gap-4">
          <div class="text-2xl font-bold {getTimerColor()}">
            {timeLeft}s
          </div>
          <Button variant="ghost" size="sm" onclick={() => goto('/dashboard')} class="text-white hover:bg-white/20">
            <Icon name="x" size={16} />
          </Button>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="max-w-4xl mx-auto mt-2">
        <div class="w-full bg-white/20 rounded-full h-2">
          <div 
            class="bg-white rounded-full h-2 transition-all duration-300"
            style="width: {getProgressPercentage()}%"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex items-center justify-center p-4 min-h-[calc(100vh-120px)]">
      {#if gameType === 'quiz'}
        <!-- Quiz Mode -->
        <Card class="p-8 max-w-2xl w-full bg-white/95 backdrop-blur">
          <div class="space-y-6">
            <h2 class="text-2xl font-bold text-gray-800 text-center">
              {getCurrentQuestion().question}
            </h2>
            
            <div class="grid grid-cols-1 gap-3">
              {#each getCurrentQuestion().options as option, index}
                <Button
                  variant={selectedAnswer === index ? 
                    (isCorrect === true ? 'default' : 'destructive') : 
                    (selectedAnswer !== null && index === getCurrentQuestion().correctAnswer ? 'default' : 'outline')
                  }
                  class="p-4 text-left h-auto justify-start text-wrap transition-all duration-300 transform hover:scale-105 {
                    selectedAnswer === index ? 
                      (isCorrect === true ? 'bg-green-500 hover:bg-green-600 shadow-lg animate-pulse' : 'bg-red-500 hover:bg-red-600 shadow-lg') : 
                      (selectedAnswer !== null && index === getCurrentQuestion().correctAnswer ? 'bg-green-500 hover:bg-green-600 shadow-lg animate-pulse' : 'hover:bg-blue-50')
                  }"
                  onclick={() => handleQuizAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-white/20 flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div class="flex-1">{option}</div>
                    {#if selectedAnswer !== null}
                      {#if index === getCurrentQuestion().correctAnswer}
                        <Icon name="check" size={20} className="text-white" />
                      {:else if selectedAnswer === index && !isCorrect}
                        <Icon name="x" size={20} className="text-white" />
                      {/if}
                    {/if}
                  </div>
                </Button>
              {/each}
            </div>

            {#if selectedAnswer !== null && getCurrentQuestion().explanation}
              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-2">Explanation</h4>
                <p class="text-blue-700">{getCurrentQuestion().explanation}</p>
              </div>
            {/if}
          </div>
        </Card>
      {:else}
        <!-- Flashcard Mode -->
        <Card class="p-8 max-w-2xl w-full bg-white/95 backdrop-blur">
          {#if !showAnswer}
            <div class="space-y-6 text-center">
              <div class="text-sm text-gray-500 font-medium">QUESTION</div>
              <h2 class="text-2xl font-bold text-gray-800">
                {getCurrentFlashcard().question}
              </h2>
              <Button 
                class="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500"
                onclick={handleFlashcardReveal}
              >
                <Icon name="eye" size={20} className="mr-2" />
                Reveal Answer
              </Button>
            </div>
          {:else}
            <div class="space-y-6">
              <div class="text-center space-y-4">
                <div class="text-sm text-gray-500 font-medium">ANSWER</div>
                <div class="p-4 bg-blue-50 rounded-lg">
                  <p class="text-lg text-gray-800">{getCurrentFlashcard().answer}</p>
                </div>
              </div>
              
              <div class="space-y-3">
                <p class="text-center text-sm text-gray-600 font-medium">How well did you know this?</p>
                <div class="grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline"
                    class="py-3 bg-red-50 border-red-200 hover:bg-red-100"
                    onclick={() => handleFlashcardConfidence('hard')}
                  >
                    <div class="text-center">
                      <div class="text-red-600 font-bold">😓</div>
                      <div class="text-xs text-red-600">Hard</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline"
                    class="py-3 bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                    onclick={() => handleFlashcardConfidence('medium')}
                  >
                    <div class="text-center">
                      <div class="text-yellow-600 font-bold">🤔</div>
                      <div class="text-xs text-yellow-600">Medium</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline"
                    class="py-3 bg-green-50 border-green-200 hover:bg-green-100"
                    onclick={() => handleFlashcardConfidence('easy')}
                  >
                    <div class="text-center">
                      <div class="text-green-600 font-bold">😊</div>
                      <div class="text-xs text-green-600">Easy</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          {/if}
        </Card>
      {/if}
    </div>
  </div>
{/if}

<!-- Celebration Overlay -->
{#if showCelebration}
  <div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
    <div class="text-center animate-bounce">
      <div class="text-8xl mb-4">🎉</div>
      <div class="text-4xl font-bold text-white mb-2">AWESOME!</div>
      <div class="text-2xl text-yellow-300">🔥 {streak} in a row!</div>
    </div>
  </div>
{/if} 