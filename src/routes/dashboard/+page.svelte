<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';
  import TrendingTopics from '$lib/components/TrendingTopics.svelte';

  let isAuthenticated = $state(false);
  let user = $state<{name: string, email: string} | null>(null);
  let isDemo = $state(false);

  let topic = $state('');
  let contentType = $state('flashcards');
  let difficulty = $state('medium');
  let cardCount = $state(10);
  let includeCurrentEvents = $state(false);
  let enableFactChecking = $state(false);
  let includeSources = $state(false);
  let targetAudience = $state('general');
  let contentFreshness = $state('any');
  let isGenerating = $state(false);
  let showAdvanced = $state(false);
  let uploadedFile = $state<File | null>(null);
  let error = $state('');

  let features = [
    {
      icon: "trending",
      title: "Real-Time Trending Topics",
      description: "Generate content from the latest trending topics and current events",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      href: "/dashboard/trending"
    },
    {
      icon: "lightbulb",
      title: "AI Research Assistant",
      description: "Multi-perspective analysis with academic and industry insights",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      href: "/dashboard/research"
    },
    {
      icon: "activity",
      title: "Live Data Learning",
      description: "Real-time market data, weather, sports, and economic insights",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      href: "/dashboard/live-data"
    },
    {
      icon: "globe",
      title: "Global Events Tracker",
      description: "Stay updated with worldwide events and their educational context",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      href: "/dashboard/global-events"
    },
    {
      icon: "search",
      title: "Science Breakthrough Monitor",
      description: "Latest research findings and scientific discoveries",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      href: "/dashboard/science"
    },
    {
      icon: "star",
      title: "Learning Competitions",
      description: "Competitive learning with real-time leaderboards",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
      href: "/dashboard/competitions"
    }
  ];

  onMount(() => {
    // Check authentication
    const auth = localStorage.getItem('cogniZapAuth');
    if (!auth) {
      // Small delay to ensure page is fully loaded before redirect
      setTimeout(() => {
        goto('/auth/login');
      }, 100);
      return;
    }

    isAuthenticated = true;
    
    // Get user data
    const userData = localStorage.getItem('cogniZapUser');
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        // Clear invalid user data
        localStorage.removeItem('cogniZapUser');
      }
    }

    // Check if demo mode
    if ($page.url.searchParams.get('demo') === 'true') {
      isDemo = true;
      // Pre-fill demo data
      topic = "Artificial Intelligence Ethics";
      includeCurrentEvents = true;
      enableFactChecking = true;
      includeSources = true;
    }
  });

  async function generateContent() {
    // Double-check authentication before proceeding
    const auth = localStorage.getItem('cogniZapAuth');
    if (!auth || !isAuthenticated) {
      error = 'Authentication required. Redirecting...';
      setTimeout(() => {
        goto('/auth/login');
      }, 1000);
      return;
    }

    // Check if either topic is provided OR file is uploaded
    if (!topic.trim() && !uploadedFile) {
      error = 'Please enter a topic or upload a PDF/PowerPoint file';
      return;
    }
    
    error = '';
    isGenerating = true;
    
    try {
      let requestBody: any = {
        type: contentType, // Use selected content type
        count: cardCount, // Fixed parameter name
        difficulty,
        includeCurrentEvents,
        factCheck: enableFactChecking, // Fixed parameter name
        includeSources,
        targetAudience,
        contentFreshness
      };

      // If file is uploaded, handle file upload and extract text
      if (uploadedFile) {
        try {
          console.log('📁 Processing uploaded file:', uploadedFile.name);
          
          // First, upload and extract text from the file
          const fileFormData = new FormData();
          fileFormData.append('file', uploadedFile);
          
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: fileFormData
          });
          
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => ({}));
            throw new Error(uploadError.error || 'Failed to process uploaded file');
          }
          
          const uploadResult = await uploadResponse.json();
          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Failed to extract text from file');
          }
          
          // Use extracted text as the base content for generation
          const extractedText = uploadResult.text;
          const topicFromFile = topic.trim() || `Analysis of ${uploadedFile.name.replace(/\.[^/.]+$/, "")}`;
          
          // Combine user topic with extracted content
          requestBody.topic = topic.trim() ? 
            `${topic.trim()}\n\nBased on the following document content:\n${extractedText}` :
            `Generate educational content based on the following document:\n\n${extractedText}`;
          requestBody.isFileUpload = true;
          requestBody.fileName = uploadedFile.name;
          requestBody.extractedText = extractedText.substring(0, 2000); // Limit for debugging
          
          console.log('✅ Successfully extracted text from file, length:', extractedText.length);
          
        } catch (fileError) {
          console.error('File processing error:', fileError);
          error = `File processing failed: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`;
          return;
        }
      } else {
        requestBody.topic = topic.trim();
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Redirect to gamified experience instead of results page
          goto(`/play?data=${encodeURIComponent(JSON.stringify(data))}`);
        } else {
          // Handle API errors with more specific messages
          error = data.error || 'Failed to generate content. Please try again.';
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Generation failed:', response.status, errorData);
        
        // Provide more specific error messages based on status code
        if (response.status === 401) {
          error = 'Authentication error. Please check your API key configuration.';
        } else if (response.status === 429) {
          error = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (response.status === 503) {
          error = 'Service temporarily unavailable. Please try again in a few minutes.';
        } else if (response.status >= 500) {
          error = 'Server error. Please try again later.';
        } else {
          error = errorData.error || 'Failed to generate content. Please check your connection and try again.';
        }
      }
    } catch (err) {
      console.error('Error:', err);
      error = 'Network error. Please check your connection and try again.';
    } finally {
      isGenerating = false;
    }
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      uploadedFile = file;
    }
  }

  function logout() {
    localStorage.removeItem('cogniZapAuth');
    localStorage.removeItem('cogniZapUser');
    goto('/');
  }

  function navigateToFeature(href: string) {
    goto(href);
  }
</script>

<svelte:head>
  <title>Dashboard - CogniZap</title>
</svelte:head>

{#if !isAuthenticated}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <Icon name="loader" size={32} className="animate-spin text-primary mx-auto mb-4" />
      <p class="text-muted-foreground">Loading...</p>
    </div>
  </div>
{:else}
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <ProfessionalSidebar class="hidden lg:block" />
    
    <!-- Main Content -->
    <div class="flex-1 overflow-auto">
      <div class="container mx-auto px-4 py-8 max-w-7xl">
        
        <!-- Welcome Section -->
        <section class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                {isDemo ? 'Demo Dashboard' : 'Dashboard'}
              </h1>
              {#if user}
                <p class="text-lg text-muted-foreground mt-1">Welcome back, {user.name}!</p>
              {/if}
            </div>
            
            <div class="flex items-center gap-4">
              {#if isDemo}
                <Badge variant="secondary" class="px-3 py-1">
                  <Icon name="play" size={14} className="mr-1" />
                  Demo Mode
                </Badge>
              {/if}
              <Button variant="outline" size="sm" onclick={logout}>
                <Icon name="log-out" size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          <div class="text-center space-y-4">
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate intelligent flashcards and quizzes from trending topics, current events, 
              and real-time data. Choose a tool below or create custom content.
            </p>
          </div>
        </section>

        <!-- Main Generation Form -->
        <section class="max-w-4xl mx-auto space-y-8 mb-12">
          <Card class="p-8 shadow-lg border-2 border-primary/10 bg-gradient-to-br from-background to-muted/30">
            <div class="space-y-6">
              <div class="text-center space-y-2">
                <h3 class="text-2xl font-bold flex items-center justify-center gap-2">
                  <Icon name="zap" size={24} className="text-primary" />
                  Generate Learning Content
                </h3>
                <p class="text-muted-foreground">
                  Enter a topic or upload a document to create personalized learning materials
                </p>
              </div>
              
              <!-- Topic Input -->
              <div class="space-y-4">
                <Input
                  label="Learning Topic {uploadedFile ? '(Optional)' : ''}"
                  placeholder="e.g., Climate Change, Quantum Computing, Machine Learning..."
                  bind:value={topic}
                  class="text-lg"
                  description={uploadedFile ? "Optional: Add a specific topic to focus on, or leave empty to generate from the file content" : "Enter any topic you want to learn about"}
                />

                <!-- Content Type Selection -->
                <div class="space-y-2">
                  <fieldset>
                    <legend class="text-sm font-medium">Content Type</legend>
                    <div class="flex gap-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" bind:group={contentType} value="flashcards" class="text-primary" />
                      <Icon name="bookmark" size={16} className="text-muted-foreground" />
                      <span>Flashcards</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" bind:group={contentType} value="quiz" class="text-primary" />
                      <Icon name="help-circle" size={16} className="text-muted-foreground" />
                      <span>Quiz</span>
                    </label>
                    </div>
                  </fieldset>
                </div>

                <!-- File Upload -->
                <div class="border-2 border-dashed {uploadedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-muted/20'} rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  {#if !uploadedFile}
                    <Icon name="upload" size={24} className="text-muted-foreground mb-2 mx-auto" />
                    <p class="text-sm text-muted-foreground mb-2">
                      Or upload a PDF/PowerPoint file
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onchange={handleFileUpload}
                      class="hidden"
                      id="file-upload"
                    />
                    <Button variant="outline" onclick={() => document.getElementById('file-upload')?.click()}>
                      Choose File
                    </Button>
                  {:else}
                    <Icon name="file-text" size={24} className="text-primary mb-2 mx-auto" />
                    <p class="text-sm text-primary font-medium mb-2">
                      <Icon name="check" size={16} className="inline mr-1" />
                      File uploaded: {uploadedFile.name}
                    </p>
                    <div class="flex gap-2 justify-center">
                      <Button variant="outline" size="sm" onclick={() => document.getElementById('file-upload')?.click()}>
                        Change File
                      </Button>
                      <Button variant="outline" size="sm" onclick={() => { 
                        uploadedFile = null; 
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}>
                        Remove File
                      </Button>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onchange={handleFileUpload}
                      class="hidden"
                      id="file-upload"
                    />
                  {/if}
                </div>
              </div>

              <!-- Basic Options -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label for="difficulty-select" class="text-sm font-medium">Difficulty Level</label>
                  <select id="difficulty-select" bind:value={difficulty} class="w-full p-3 border border-input rounded-md bg-background">
                    <option value="beginner">Beginner</option>
                    <option value="medium">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div class="space-y-2">
                  <label for="cardcount-select" class="text-sm font-medium">
                    Number of {contentType === 'flashcards' ? 'Cards' : 'Questions'}
                  </label>
                  <select id="cardcount-select" bind:value={cardCount} class="w-full p-3 border border-input rounded-md bg-background">
                    <option value={5}>5 {contentType === 'flashcards' ? 'Cards' : 'Questions'}</option>
                    <option value={10}>10 {contentType === 'flashcards' ? 'Cards' : 'Questions'}</option>
                    <option value={15}>15 {contentType === 'flashcards' ? 'Cards' : 'Questions'}</option>
                    <option value={20}>20 {contentType === 'flashcards' ? 'Cards' : 'Questions'}</option>
                  </select>
                </div>
                
                <div class="space-y-2">
                  <label for="audience-select" class="text-sm font-medium">Target Audience</label>
                  <select id="audience-select" bind:value={targetAudience} class="w-full p-3 border border-input rounded-md bg-background">
                    <option value="general">General</option>
                    <option value="students">Students</option>
                    <option value="professionals">Professionals</option>
                    <option value="researchers">Researchers</option>
                  </select>
                </div>
              </div>

              <!-- Advanced Options Toggle -->
              <div class="border-t pt-4">
                <Button 
                  variant="ghost"
                  class="w-full justify-between"
                  onclick={() => showAdvanced = !showAdvanced}
                >
                  <span>Advanced Options</span>
                  <Icon name="chevron-down" size={16} className="transition-transform {showAdvanced ? 'rotate-180' : ''}" />
                </Button>

                {#if showAdvanced}
                  <div class="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="flex items-center space-x-2">
                        <input type="checkbox" bind:checked={includeCurrentEvents} id="current-events" class="rounded" />
                        <label for="current-events" class="text-sm font-medium">Include Current Events</label>
                      </div>

                      <div class="flex items-center space-x-2">
                        <input type="checkbox" bind:checked={enableFactChecking} id="fact-check" class="rounded" />
                        <label for="fact-check" class="text-sm font-medium">Enable Fact Checking</label>
                      </div>

                      <div class="flex items-center space-x-2">
                        <input type="checkbox" bind:checked={includeSources} id="sources" class="rounded" />
                        <label for="sources" class="text-sm font-medium">Include Source Citations</label>
                      </div>
                      
                      <div class="space-y-2">
                        <label for="freshness-select" class="text-sm font-medium">Content Freshness</label>
                        <select id="freshness-select" bind:value={contentFreshness} class="w-full p-2 border border-input rounded-md bg-background text-sm">
                          <option value="any">Any Time</option>
                          <option value="recent">Recent (Last Month)</option>
                          <option value="latest">Latest (Last Week)</option>
                          <option value="today">Today Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Error Display -->
              {#if error}
                <div class="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
                  <div class="flex items-center gap-2">
                    <Icon name="alert-circle" size={16} />
                    <span class="text-sm font-medium">Error</span>
                  </div>
                  <p class="text-sm mt-1">{error}</p>
                </div>
              {/if}

              <!-- Generate Button -->
              <Button 
                class="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                onclick={generateContent}
                disabled={(!topic.trim() && !uploadedFile) || isGenerating}
              >
                {#if !isGenerating}
                  <Icon name="zap" size={20} className="mr-2" />
                  Generate {contentType === 'flashcards' ? 'Flashcards' : 'Quiz'}
                {:else}
                  <Icon name="loader" size={20} className="mr-2 animate-spin" />
                  Generating your {contentType}...
                {/if}
              </Button>
            </div>
          </Card>
        </section>

        <!-- Features Grid -->
        <section class="py-8 space-y-8">
          <div class="text-center space-y-4">
            <h3 class="text-3xl font-bold">Specialized Learning Tools</h3>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our powerful AI-driven tools for different learning scenarios
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each features as feature}
              <Card class="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group border-2 hover:border-primary/20">
                <div class="space-y-4">
                  <div class="w-12 h-12 rounded-lg {feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon name={feature.icon} size={24} className={feature.color} />
                  </div>
                  <div class="space-y-2">
                    <h4 class="text-lg font-semibold">{feature.title}</h4>
                    <p class="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    class="w-full justify-start p-0 h-auto text-primary hover:text-primary/80"
                    onclick={() => navigateToFeature(feature.href)}
                  >
                    Explore <Icon name="arrow-right" size={16} className="ml-1" />
                  </Button>
                </div>
              </Card>
            {/each}
          </div>
        </section>

        <!-- Trending Topics Section -->
        <section class="py-8">
          <TrendingTopics />
        </section>
      </div>
    </div>
  </div>
{/if} 