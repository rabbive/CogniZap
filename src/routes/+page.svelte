<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';
  import TrendingTopics from '$lib/components/TrendingTopics.svelte';

  let topic = '';
  let difficulty = 'medium';
  let cardCount = 10;
  let includeCurrentEvents = false;
  let enableFactChecking = false;
  let includeSources = false;
  let targetAudience = 'general';
  let contentFreshness = 'any';
  let isGenerating = false;
  let showAdvanced = false;
  let uploadedFile: File | null = null;

  let features = [
    {
      icon: "trending",
      title: "Real-Time Trending Topics",
      description: "Generate content from the latest trending topics and current events",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      icon: "brain",
      title: "AI Research Assistant",
      description: "Multi-perspective analysis with academic and industry insights",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
    {
      icon: "activity",
      title: "Live Data Learning",
      description: "Real-time market data, weather, sports, and economic insights",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      icon: "globe",
      title: "Global Events Tracker",
      description: "Stay updated with worldwide events and their educational context",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      icon: "search",
      title: "Science Breakthrough Monitor",
      description: "Latest research findings and scientific discoveries",
      color: "text-cyan-500",
      bgColor: "bg-cyan-50 dark:bg-cyan-950"
    },
    {
      icon: "star",
      title: "Learning Competitions",
      description: "Competitive learning with real-time leaderboards",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950"
    }
  ];

  let stats = [
    { label: "Active Learners", value: "50K+", icon: "user" },
    { label: "Cards Generated", value: "2M+", icon: "bookmark" },
    { label: "Topics Covered", value: "10K+", icon: "brain" },
    { label: "Success Rate", value: "94%", icon: "activity" }
  ];

  async function generateContent() {
    if (!topic.trim()) return;
    
    isGenerating = true;
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          cardCount,
          includeCurrentEvents,
          enableFactChecking,
          includeSources,
          targetAudience,
          contentFreshness
        })
      });

      if (response.ok) {
        const data = await response.json();
        goto(`/results?data=${encodeURIComponent(JSON.stringify(data))}`);
      } else {
        console.error('Generation failed');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      isGenerating = false;
    }
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      uploadedFile = file;
      // Handle file upload logic here
    }
  }

  function startDemo() {
    topic = "Artificial Intelligence Ethics";
    includeCurrentEvents = true;
    enableFactChecking = true;
    includeSources = true;
    generateContent();
  }
</script>

<div class="flex min-h-screen bg-background">
  <!-- Sidebar -->
  <ProfessionalSidebar class="hidden lg:block" />
  
  <!-- Main Content -->
  <div class="flex-1 overflow-auto">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      
      <!-- Hero Section -->
      <section class="text-center py-16 space-y-8">
        <div class="space-y-4">
          <Badge variant="secondary" class="mb-4">
            <Icon name="sparkles" size={12} className="mr-1" />
            Powered by Perplexity Sonar API
          </Badge>
          
          <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-fade-in">
            Learn Smarter with
            <span class="block">Real-Time AI</span>
          </h1>
          
          <p class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Generate intelligent flashcards and quizzes from trending topics, current events, 
            and real-time data. Stay ahead with AI-powered learning that adapts to the world around you.
          </p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {#each stats as stat}
            <div class="text-center space-y-2">
              <div class="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name={stat.icon} size={24} className="text-primary" />
              </div>
              <div class="text-2xl font-bold">{stat.value}</div>
              <div class="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          {/each}
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 text-lg"
            onclick={startDemo}
          >
            <Icon name="zap" size={20} className="mr-2" />
            Try Demo
          </button>
          <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 text-lg">
            <Icon name="bookmark" size={20} className="mr-2" />
            Learn More
          </button>
        </div>
      </section>

      <!-- Main Generation Form -->
      <section class="max-w-4xl mx-auto space-y-8">
        <Card class="p-8 shadow-lg border-2 border-primary/10">
          <div class="space-y-6">
            <div class="text-center space-y-2">
              <h2 class="text-2xl font-bold flex items-center justify-center gap-2">
                <Icon name="zap" size={24} className="text-primary" />
                Generate Learning Content
              </h2>
              <p class="text-muted-foreground">
                Enter a topic or upload a document to create personalized learning materials
              </p>
            </div>

            <!-- Topic Input -->
            <div class="space-y-4">
              <Input
                label="Learning Topic"
                placeholder="e.g., Climate Change, Quantum Computing, Machine Learning..."
                bind:value={topic}
                class="text-lg"
                description="Enter any topic you want to learn about"
              />

              <!-- File Upload -->
              <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Icon name="upload" size={24} className="text-muted-foreground mb-2" />
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
                <button class="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors" onclick={() => document.getElementById('file-upload')?.click()}>
                  Choose File
                </button>
                {#if uploadedFile}
                  <p class="text-sm text-primary mt-2">
                    <Icon name="check" size={16} className="inline mr-1" />
                    {uploadedFile.name}
                  </p>
                {/if}
              </div>
            </div>

            <!-- Basic Options -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Difficulty Level</label>
                <select bind:value={difficulty} class="w-full p-2 border border-input rounded-md bg-background">
                  <option value="beginner">Beginner</option>
                  <option value="medium">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Number of Cards</label>
                <select bind:value={cardCount} class="w-full p-2 border border-input rounded-md bg-background">
                  <option value={5}>5 Cards</option>
                  <option value={10}>10 Cards</option>
                  <option value={15}>15 Cards</option>
                  <option value={20}>20 Cards</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Target Audience</label>
                <select bind:value={targetAudience} class="w-full p-2 border border-input rounded-md bg-background">
                  <option value="general">General</option>
                  <option value="students">Students</option>
                  <option value="professionals">Professionals</option>
                  <option value="researchers">Researchers</option>
                </select>
              </div>
            </div>

            <!-- Advanced Options Toggle -->
            <div class="border-t pt-4">
              <button 
                class="hover:bg-accent hover:text-accent-foreground w-full justify-between inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
                onclick={() => showAdvanced = !showAdvanced}
              >
                <span>Advanced Options</span>
                <Icon name="arrow-right" size={16} class="h-4 w-4 transition-transform {showAdvanced ? 'rotate-90' : ''}" />
              </button>

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
                      <label class="text-sm font-medium">Content Freshness</label>
                      <select bind:value={contentFreshness} class="w-full p-2 border border-input rounded-md bg-background text-sm">
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

            <!-- Generate Button -->
            <button 
              class="w-full py-4 text-lg font-semibold inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8"
              onclick={generateContent}
              disabled={!topic.trim() && !uploadedFile}
            >
              {#if !isGenerating}
                <Icon name="zap" size={20} className="mr-2" />
                Generate Learning Content
              {:else}
                <svg
                  class="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating your content...
              {/if}
            </button>
          </div>
        </Card>
      </section>

      <!-- Features Grid -->
      <section class="py-16 space-y-8">
        <div class="text-center space-y-4">
          <h2 class="text-3xl font-bold">Powerful AI Features</h2>
          <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
            Leverage cutting-edge AI capabilities to enhance your learning experience
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each features as feature}
            <Card class="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-lg {feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon name={feature.icon} size={24} className={feature.color} />
                </div>
                <div class="space-y-2">
                  <h3 class="text-lg font-semibold">{feature.title}</h3>
                  <p class="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <button class="hover:bg-accent hover:text-accent-foreground w-full justify-start p-0 h-auto text-primary hover:text-primary/80 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  Learn more <Icon name="arrow-right" size={16} className="h-4 w-4 ml-1" />
                </button>
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
