<script lang="ts">
  import { goto } from '$app/navigation';
  import type { EnhancedGenerateRequest } from '$lib/types';
  import { flashcardActions } from '$lib/stores/flashcardStore';
  import { quizActions } from '$lib/stores/quizStore';
  import { userPreferences, enhancedActions } from '$lib/stores/enhancedStore';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import TrendingTopics from '$lib/components/TrendingTopics.svelte';
  import { cn } from '$lib/utils.js';

  let topic = $state('');
  let contentType = $state<'flashcards' | 'quiz'>('flashcards');
  let difficulty = $state<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  let count = $state(10);
  let isGenerating = $state(false);
  let isUploading = $state(false);
  let uploadedFile: { name: string; size: number; text: string } | null = $state(null);
  let error = $state('');
  
  // Enhanced features
  let includeCurrentEvents = $state(false);
  let factCheck = $state(true);
  let includeSources = $state(true);
  let targetAudience = $state<'student' | 'professional' | 'researcher'>('student');
  let contentFreshness = $state<'latest' | 'recent' | 'any'>('recent');
  let showAdvancedOptions = $state(false);

  async function handleGenerate() {
    if (!topic.trim() && !uploadedFile) {
      error = 'Please enter a topic or upload a file';
      return;
    }

    isGenerating = true;
    error = '';

    try {
      // Use uploaded file content if available, otherwise use topic
      const contentToGenerate = uploadedFile?.text || topic;
      
      const enhancedRequest: EnhancedGenerateRequest = {
        topic: contentToGenerate,
        type: contentType,
        count,
        difficulty,
        preferences: $userPreferences,
        includeCurrentEvents,
        factCheck,
        includeSources,
        targetAudience,
        contentFreshness
      };
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedRequest)
      });

      const result = await response.json();

      if (result.success) {
        // Store sources and fact-check results
        if (result.sources) {
          enhancedActions.updateSources(result.sources);
        }
        if (result.factCheckResults) {
          result.factCheckResults.forEach((factCheck: any) => {
            enhancedActions.addFactCheckResult(factCheck);
          });
        }

        // Track topic interaction
        enhancedActions.trackTopicInteraction(contentToGenerate);

        if (contentType === 'flashcards') {
          flashcardActions.setFlashcards(result.data);
        } else {
          quizActions.startQuiz(result.data);
        }
        goto('/results');
      } else {
        error = result.error || 'Failed to generate content';
      }
    } catch (err) {
      error = 'Network error. Please check your connection and try again.';
      console.error('Generate error:', err);
    } finally {
      isGenerating = false;
    }
  }

  function handleTrendingTopicSelect(selectedTopic: string) {
    topic = selectedTopic;
    includeCurrentEvents = true;
    contentFreshness = 'latest';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleGenerate();
    }
  }

  async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) return;
    
    isUploading = true;
    error = '';
    uploadedFile = null;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        uploadedFile = {
          name: result.filename || file.name,
          size: result.fileSize || file.size,
          text: result.text || ''
        };
        
        // Auto-set topic from uploaded content preview
        const preview = result.text.substring(0, 200) + (result.text.length > 200 ? '...' : '');
        topic = `Content from uploaded file: ${result.filename}\n\nPreview: ${preview}`;
        
        // Clear file input
        target.value = '';
      } else {
        error = result.error || 'Failed to process uploaded file';
      }
    } catch (err) {
      error = 'Network error. Please check your connection and try again.';
      console.error('Upload error:', err);
    } finally {
      isUploading = false;
    }
  }
</script>

<svelte:head>
  <title>CogniZap - AI-Powered Flashcards & Quizzes</title>
  <meta name="description" content="Generate flashcards and quizzes from any topic using AI" />
</svelte:head>

<!-- Hero Section with animated background -->
<div class="min-h-screen bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20 relative overflow-hidden">
  <!-- Animated background elements -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
  </div>

  <div class="relative z-10">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-16 animate-fade-in">
        <div class="flex justify-center items-center gap-4 mb-6">
          <div class="p-4 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
            <span class="text-4xl">⚡</span>
          </div>
          <h1 class="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CogniZap
          </h1>
        </div>
        <p class="text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed">
          Transform any topic into interactive flashcards and quizzes using AI. 
          Perfect for studying, teaching, or quick knowledge checks with state-of-the-art technology.
        </p>
        <div class="flex justify-center gap-2 mt-4">
          <div class="badge badge-primary badge-lg gap-2">
            <span class="text-lg">✨</span>
            AI-Powered
          </div>
          <div class="badge badge-secondary badge-lg gap-2">
            <span class="text-lg">⏱️</span>
            Real-time
          </div>
          <div class="badge badge-accent badge-lg gap-2">
            <span class="text-lg">🎯</span>
            Adaptive
          </div>
        </div>
      </div>

      <!-- Main Form -->
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Trending Topics Sidebar -->
          <div class="lg:col-span-1 order-2 lg:order-1">
            <TrendingTopics 
              category="technology" 
              limit={8}
              onTopicSelect={handleTrendingTopicSelect}
            />
            
            <!-- News-based Learning -->
            <Card class="mt-6">
              <div class="card-body p-4">
                <h3 class="card-title text-lg flex items-center gap-2">
                  <span class="text-2xl">📰</span>
                  News Learning
                </h3>
                <p class="text-sm text-base-content/70 mb-4">
                  Generate content from current events
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onclick={() => {
                    includeCurrentEvents = true;
                    contentFreshness = 'latest';
                    topic = 'Generate educational content from today\'s trending news in technology and science';
                  }}
                  class="w-full"
                >
                  📈 Use Today's News
                </Button>
              </div>
            </Card>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3 order-1 lg:order-2">
            <Card class="backdrop-blur-sm bg-base-100/90 border border-base-300/50">
              <div class="card-body p-8 lg:p-12">
                <!-- Enhanced Features Toggle -->
                <div class="mb-6">
                  <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold flex items-center gap-2">
                      <span class="text-3xl">⚡</span>
                      Enhanced Generation
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onclick={() => showAdvancedOptions = !showAdvancedOptions}
                    >
                      {showAdvancedOptions ? '🔼' : '🔽'} Advanced Options
                    </Button>
                  </div>
                  
                  {#if showAdvancedOptions}
                    <div class="mt-6 p-6 bg-base-200/50 rounded-lg border border-base-300">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Enhanced Features -->
                        <div class="space-y-4">
                          <h4 class="font-semibold text-lg">🚀 Enhanced Features</h4>
                          
                          <label class="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              class="checkbox checkbox-primary" 
                              bind:checked={includeCurrentEvents}
                            />
                            <div>
                              <div class="font-medium">📈 Current Events</div>
                              <div class="text-sm text-base-content/60">Include trending topics and recent news</div>
                            </div>
                          </label>
                          
                          <label class="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              class="checkbox checkbox-primary" 
                              bind:checked={factCheck}
                            />
                            <div>
                              <div class="font-medium">✅ Fact Checking</div>
                              <div class="text-sm text-base-content/60">Verify information accuracy</div>
                            </div>
                          </label>
                          
                          <label class="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              class="checkbox checkbox-primary" 
                              bind:checked={includeSources}
                            />
                            <div>
                              <div class="font-medium">📚 Source Citations</div>
                              <div class="text-sm text-base-content/60">Include reliable source links</div>
                            </div>
                          </label>
                        </div>
                        
                        <!-- Target Audience & Freshness -->
                        <div class="space-y-4">
                          <h4 class="font-semibold text-lg">🎯 Customization</h4>
                          
                          <div class="form-control">
                            <label class="label">
                              <span class="label-text font-medium">👥 Target Audience</span>
                            </label>
                            <select class="select select-bordered" bind:value={targetAudience}>
                              <option value="student">🎓 Student</option>
                              <option value="professional">💼 Professional</option>
                              <option value="researcher">🔬 Researcher</option>
                            </select>
                          </div>
                          
                          <div class="form-control">
                            <label class="label">
                              <span class="label-text font-medium">⏰ Content Freshness</span>
                            </label>
                            <select class="select select-bordered" bind:value={contentFreshness}>
                              <option value="latest">🔥 Latest (This week)</option>
                              <option value="recent">📅 Recent (This month)</option>
                              <option value="any">📚 Any timeframe</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>

                <!-- Content Type Selection -->
                <div class="form-control mb-8">
                  <label class="label" for="content-type">
                    <span class="label-text text-xl font-bold flex items-center gap-2">
                      <span class="text-2xl">🧠</span>
                      What would you like to create?
                    </span>
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="content-type">
                    <label class="cursor-pointer">
                      <input 
                        type="radio" 
                        name="contentType" 
                        class="sr-only peer" 
                        bind:group={contentType}
                        value="flashcards"
                      />
                      <div class={cn(
                        "card bg-gradient-to-br from-base-200 to-base-300 hover:from-primary/10 hover:to-primary/20 transition-all duration-300 transform hover:scale-105",
                        "border-2 border-transparent peer-checked:border-primary peer-checked:bg-gradient-to-br peer-checked:from-primary/10 peer-checked:to-primary/20 peer-checked:shadow-lg peer-checked:shadow-primary/25"
                      )}>
                        <div class="card-body p-6">
                          <div class="flex items-center gap-4">
                            <div class="p-3 bg-primary/20 rounded-xl">
                              <span class="text-3xl">📚</span>
                            </div>
                            <div>
                              <div class="text-xl font-bold">📚 Flashcards</div>
                              <div class="text-sm text-base-content/60">Study with interactive flip cards</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                    
                    <label class="cursor-pointer">
                      <input 
                        type="radio" 
                        name="contentType" 
                        class="sr-only peer" 
                        bind:group={contentType}
                        value="quiz"
                      />
                      <div class={cn(
                        "card bg-gradient-to-br from-base-200 to-base-300 hover:from-secondary/10 hover:to-secondary/20 transition-all duration-300 transform hover:scale-105",
                        "border-2 border-transparent peer-checked:border-secondary peer-checked:bg-gradient-to-br peer-checked:from-secondary/10 peer-checked:to-secondary/20 peer-checked:shadow-lg peer-checked:shadow-secondary/25"
                      )}>
                        <div class="card-body p-6">
                          <div class="flex items-center gap-4">
                            <div class="p-3 bg-secondary/20 rounded-xl">
                              <span class="text-3xl">🧠</span>
                            </div>
                            <div>
                              <div class="text-xl font-bold">🧠 Quiz</div>
                              <div class="text-sm text-base-content/60">Test your knowledge with questions</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Topic Input -->
                <div class="form-control mb-8">
                  <label class="label" for="topic-input">
                    <span class="label-text text-lg font-semibold">Enter your topic</span>
                  </label>
                  <div class="relative">
                    <textarea 
                      id="topic-input"
                      class="textarea textarea-bordered textarea-lg w-full min-h-[120px] resize-none focus:textarea-primary transition-all duration-300"
                      placeholder="e.g., JavaScript async/await, Photosynthesis, World War II, Machine Learning basics..."
                      bind:value={topic}
                      onkeydown={handleKeydown}
                    ></textarea>
                    <div class="absolute top-4 right-4 text-xs text-base-content/40">
                      Press Enter to generate
                    </div>
                  </div>
                </div>

                <!-- Settings -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <!-- Difficulty -->
                  <div class="form-control">
                    <label class="label" for="difficulty-select">
                      <span class="label-text font-semibold flex items-center gap-2">
                        <span class="text-xl">🎯</span>
                        Difficulty Level
                      </span>
                    </label>
                    <select id="difficulty-select" class="select select-bordered select-lg focus:select-primary" bind:value={difficulty}>
                      <option value="mixed">🎯 Mixed Difficulty</option>
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  </div>

                  <!-- Count -->
                  <div class="form-control">
                    <label class="label" for="count-select">
                      <span class="label-text font-semibold flex items-center gap-2">
                        <span class="text-xl">📊</span>
                        Number of {contentType === 'flashcards' ? 'Cards' : 'Questions'}
                      </span>
                    </label>
                    <select id="count-select" class="select select-bordered select-lg focus:select-primary" bind:value={count}>
                      <option value={5}>⚡ 5 - Quick Study</option>
                      <option value={10}>📚 10 - Standard</option>
                      <option value={15}>�� 15 - Comprehensive</option>
                      <option value={20}>🚀 20 - Deep Dive</option>
                    </select>
                  </div>
                </div>

                <!-- File Upload -->
                <div class="form-control mb-8">
                  <label class="label" for="file-upload">
                    <span class="label-text font-semibold flex items-center gap-2">
                      <span class="text-xl">📎</span>
                      Or upload a file 
                      <div class="badge badge-accent badge-sm">Beta</div>
                    </span>
                  </label>
                  
                  {#if uploadedFile}
                    <!-- Uploaded File Display -->
                    <div class="alert alert-success mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div class="flex-1">
                        <div class="font-bold">File uploaded successfully!</div>
                        <div class="text-sm opacity-80">
                          📄 {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                        <div class="text-xs opacity-60 mt-1">
                          {uploadedFile.text.length} characters extracted
                        </div>
                      </div>
                      <button 
                        class="btn btn-ghost btn-sm"
                        onclick={() => {
                          uploadedFile = null;
                          topic = '';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  {/if}
                  
                  <div class="relative">
                    <input 
                      id="file-upload"
                      type="file" 
                      class="file-input file-input-bordered file-input-lg w-full" 
                      accept=".pdf,.ppt,.pptx"
                      onchange={handleFileUpload}
                      disabled={isUploading}
                    />
                    {#if isUploading}
                      <div class="absolute inset-0 bg-base-200/80 rounded-lg flex items-center justify-center">
                        <div class="flex items-center gap-3">
                          <span class="loading loading-spinner loading-md"></span>
                          <span class="text-sm font-medium">Processing file...</span>
                        </div>
                      </div>
                    {/if}
                  </div>
                  
                  <label class="label">
                    <span class="label-text-alt">Supported formats: PDF, PowerPoint (.ppt, .pptx) • Max size: 10MB</span>
                    <span class="label-text-alt text-primary">✨ New: PPT & PDF support!</span>
                  </label>
                </div>

                <!-- Error Display -->
                {#if error}
                  <div class="alert alert-error mb-8 animate-shake">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                {/if}

                <!-- Generate Button -->
                <Button 
                  variant="primary" 
                  size="lg" 
                  shape="block"
                  loading={isGenerating}
                  disabled={isGenerating || (!topic.trim() && !uploadedFile)}
                  onclick={handleGenerate}
                  class="btn-lg h-16 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {#if isGenerating}
                    Generating {contentType}...
                  {:else if uploadedFile}
                    <span class="text-2xl mr-2">📄</span>
                    Generate {contentType === 'flashcards' ? 'Flashcards' : 'Quiz'} from File
                  {:else}
                    <span class="text-2xl mr-2">⚡</span>
                    Generate {contentType === 'flashcards' ? 'Flashcards' : 'Quiz'}
                  {/if}
                </Button>
              </div>
            </Card>
            
            <!-- Features Grid -->
            <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {#each [
                { icon: '🤖', title: 'AI-Powered', desc: 'Uses Perplexity Sonar API for accurate, up-to-date content generation', color: 'primary' },
                { icon: '⚡', title: 'Lightning Fast', desc: 'Generate comprehensive study materials in seconds', color: 'secondary' },
                { icon: '📱', title: 'Responsive Design', desc: 'Works perfectly on desktop, tablet, and mobile devices', color: 'accent' }
              ] as feature}
                <Card class="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                  <div class="card-body text-center p-8">
                    <div class="p-4 bg-{feature.color}/20 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span class="text-5xl">{feature.icon}</span>
                    </div>
                    <h3 class="card-title justify-center text-2xl mb-3">{feature.title}</h3>
                    <p class="text-base-content/70 leading-relaxed">{feature.desc}</p>
                  </div>
                </Card>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out;
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
</style>
