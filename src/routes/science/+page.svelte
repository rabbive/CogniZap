<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';

  let selectedField = $state('all');
  let selectedTimeframe = $state('week');
  let isLoading = $state(false);
  let discoveries: any = $state(null);
  let error = $state('');

  const fields = [
    { id: 'all', name: 'All Fields', icon: 'atom' },
    { id: 'physics', name: 'Physics', icon: 'zap' },
    { id: 'biology', name: 'Biology', icon: 'leaf' },
    { id: 'chemistry', name: 'Chemistry', icon: 'flask' },
    { id: 'medicine', name: 'Medicine', icon: 'heart' },
    { id: 'technology', name: 'Technology', icon: 'cpu' },
    { id: 'space', name: 'Space Science', icon: 'rocket' },
    { id: 'environment', name: 'Environmental', icon: 'globe' }
  ];

  const timeframes = [
    { id: 'day', name: 'Last 24 Hours', icon: 'clock' },
    { id: 'week', name: 'Last Week', icon: 'calendar' },
    { id: 'month', name: 'Last Month', icon: 'calendar' },
    { id: 'year', name: 'Last Year', icon: 'calendar' }
  ];

  onMount(() => {
    fetchScientificDiscoveries();
  });

  async function fetchScientificDiscoveries() {
    isLoading = true;
    error = '';
    
    try {
      const response = await fetch('/api/science-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          field: selectedField,
          timeframe: selectedTimeframe,
          generateEducationalContent: true 
        })
      });

      if (response.ok) {
        discoveries = await response.json();
      } else {
        error = 'Failed to fetch scientific discoveries';
      }
    } catch (err) {
      error = 'Network error occurred';
    } finally {
      isLoading = false;
    }
  }

  function handleFilterChange() {
    fetchScientificDiscoveries();
  }

  function getFieldIcon(field: string): string {
    const fieldMap: Record<string, string> = {
      physics: 'zap',
      biology: 'leaf',
      chemistry: 'flask',
      medicine: 'heart',
      technology: 'cpu',
      space: 'rocket',
      environment: 'globe',
      default: 'atom'
    };
    return fieldMap[field] || fieldMap.default;
  }

  function getFieldColor(field: string): string {
    const colorMap: Record<string, string> = {
      physics: 'text-blue-500',
      biology: 'text-green-500',
      chemistry: 'text-purple-500',
      medicine: 'text-red-500',
      technology: 'text-gray-500',
      space: 'text-indigo-500',
      environment: 'text-emerald-500',
      default: 'text-orange-500'
    };
    return colorMap[field] || colorMap.default;
  }

  function getSignificanceLevel(level: number): string {
    if (level >= 9) return 'Revolutionary';
    if (level >= 7) return 'Major';
    if (level >= 5) return 'Significant';
    if (level >= 3) return 'Notable';
    return 'Emerging';
  }

  function getSignificanceColor(level: number): string {
    if (level >= 9) return 'text-red-500';
    if (level >= 7) return 'text-orange-500';
    if (level >= 5) return 'text-yellow-500';
    if (level >= 3) return 'text-blue-500';
    return 'text-gray-500';
  }

  function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  }
</script>

<svelte:head>
  <title>Science Breakthrough Monitor - CogniZap</title>
</svelte:head>

<div class="flex min-h-screen bg-background">
  <ProfessionalSidebar class="hidden lg:block" />
  
  <div class="flex-1 overflow-auto">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Icon name="search" size={32} className="text-cyan-500" />
          <h1 class="text-3xl font-bold">Science Breakthrough Monitor</h1>
        </div>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Latest research findings and scientific discoveries from around the world
        </p>
      </div>

      <!-- Filters -->
      <Card class="p-6 mb-8">
        <div class="space-y-6">
          <!-- Field Filter -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Scientific Field</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {#each fields as field}
                <button
                  class="p-3 rounded-lg border-2 transition-all duration-200 {selectedField === field.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}"
                  onclick={() => { selectedField = field.id; handleFilterChange(); }}
                >
                  <div class="flex flex-col items-center gap-2">
                    <Icon name={field.icon} size={20} />
                    <span class="text-sm font-medium">{field.name}</span>
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Timeframe Filter -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Timeframe</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              {#each timeframes as timeframe}
                <button
                  class="p-3 rounded-lg border-2 transition-all duration-200 {selectedTimeframe === timeframe.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}"
                  onclick={() => { selectedTimeframe = timeframe.id; handleFilterChange(); }}
                >
                  <div class="flex flex-col items-center gap-2">
                    <Icon name={timeframe.icon} size={20} />
                    <span class="text-sm font-medium">{timeframe.name}</span>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>
      </Card>

      <!-- Refresh Button -->
      <div class="flex justify-center mb-6">
        <Button 
          onclick={fetchScientificDiscoveries}
          disabled={isLoading}
          loading={isLoading}
          loadingText="Fetching discoveries..."
        >
          <Icon name="refresh-cw" size={20} className="mr-2" />
          Refresh Discoveries
        </Button>
      </div>

      <!-- Error Display -->
      {#if error}
        <Card class="p-4 mb-6 border-destructive bg-destructive/5">
          <div class="flex items-center gap-2 text-destructive">
            <Icon name="alert-circle" size={20} />
            <span>{error}</span>
          </div>
        </Card>
      {/if}

      <!-- Discoveries Display -->
      {#if discoveries && discoveries.success}
        <div class="space-y-6">
          
          <!-- Recent Discoveries -->
          {#if discoveries.data?.recentDiscoveries && discoveries.data.recentDiscoveries.length > 0}
            <div>
              <h2 class="text-2xl font-bold mb-6">Recent Discoveries</h2>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {#each discoveries.data.recentDiscoveries as discovery}
                  <Card class="p-6 hover:shadow-lg transition-shadow">
                    <div class="space-y-4">
                      <!-- Discovery Header -->
                      <div class="flex items-start justify-between">
                        <div class="flex items-center gap-2">
                          <Icon name={getFieldIcon(discovery.field)} size={20} className={getFieldColor(discovery.field)} />
                          <span class="text-sm font-medium text-muted-foreground capitalize">{discovery.field}</span>
                        </div>
                        <div class="text-right">
                          <span class="text-sm text-muted-foreground">{formatDate(discovery.publishedDate)}</span>
                          {#if discovery.significanceLevel}
                            <div class="text-xs font-medium {getSignificanceColor(discovery.significanceLevel)} mt-1">
                              {getSignificanceLevel(discovery.significanceLevel)}
                            </div>
                          {/if}
                        </div>
                      </div>

                      <!-- Discovery Title -->
                      <h3 class="text-lg font-semibold leading-tight">{discovery.title}</h3>

                      <!-- Discovery Summary -->
                      <p class="text-base-content/80 leading-relaxed">{discovery.summary}</p>

                      <!-- Key Findings -->
                      {#if discovery.keyFindings && discovery.keyFindings.length > 0}
                        <div class="bg-muted/30 rounded-lg p-4">
                          <div class="flex items-center gap-2 mb-2">
                            <Icon name="lightbulb" size={16} className="text-yellow-500" />
                            <span class="text-sm font-medium">Key Findings</span>
                          </div>
                          <ul class="space-y-1">
                            {#each discovery.keyFindings as finding}
                              <li class="text-sm text-base-content/80 flex items-start gap-2">
                                <Icon name="check" size={12} className="text-green-500 mt-1 flex-shrink-0" />
                                {finding}
                              </li>
                            {/each}
                          </ul>
                        </div>
                      {/if}

                      <!-- Implications -->
                      {#if discovery.implications}
                        <div class="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                          <div class="flex items-center gap-2 mb-2">
                            <Icon name="arrow-right" size={16} className="text-blue-500" />
                            <span class="text-sm font-medium">Implications</span>
                          </div>
                          <p class="text-sm text-base-content/80">{discovery.implications}</p>
                        </div>
                      {/if}

                      <!-- Research Institution -->
                      {#if discovery.institution}
                        <div class="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon name="building" size={16} />
                          <span>{discovery.institution}</span>
                        </div>
                      {/if}

                      <!-- Related Topics -->
                      {#if discovery.relatedTopics && discovery.relatedTopics.length > 0}
                        <div class="flex flex-wrap gap-2">
                          {#each discovery.relatedTopics as topic}
                            <span class="px-2 py-1 text-xs bg-primary/10 text-primary rounded">{topic}</span>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  </Card>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Trending Research Areas -->
          {#if discoveries.data?.trendingAreas && discoveries.data.trendingAreas.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="trending-up" size={24} className="text-green-500" />
                <h3 class="text-xl font-semibold">Trending Research Areas</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each discoveries.data.trendingAreas as area}
                  <div class="border-l-4 border-primary pl-4">
                    <div class="font-medium">{area.name}</div>
                    <div class="text-sm text-muted-foreground">{area.description}</div>
                    <div class="text-xs text-primary mt-1">{area.activeResearch} active studies</div>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}

          <!-- Educational Insights -->
          {#if discoveries.data?.educationalInsights && discoveries.data.educationalInsights.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="book-open" size={24} className="text-blue-500" />
                <h3 class="text-xl font-semibold">Educational Insights</h3>
              </div>
              <div class="space-y-3">
                {#each discoveries.data.educationalInsights as insight, index}
                  <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p class="text-base-content/80">{insight}</p>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}

          <!-- Future Implications -->
          {#if discoveries.data?.futureImplications && discoveries.data.futureImplications.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="eye" size={24} className="text-purple-500" />
                <h3 class="text-xl font-semibold">Future Implications</h3>
              </div>
              <ul class="space-y-2">
                {#each discoveries.data.futureImplications as implication}
                  <li class="flex items-start gap-2">
                    <Icon name="arrow-right" size={16} className="text-purple-500 mt-1 flex-shrink-0" />
                    <span class="text-base-content/80">{implication}</span>
                  </li>
                {/each}
              </ul>
            </Card>
          {/if}

          <!-- Sources -->
          {#if discoveries.data?.sources && discoveries.data.sources.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="link" size={24} className="text-blue-500" />
                <h3 class="text-xl font-semibold">Research Sources</h3>
              </div>
              <div class="space-y-3">
                {#each discoveries.data.sources as source}
                  <div class="border-l-4 border-primary pl-4">
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="font-medium text-primary hover:underline"
                    >
                      {source.title}
                    </a>
                    <p class="text-sm text-muted-foreground mt-1">
                      {source.domain} • Reliability: {source.reliability}%
                    </p>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}
        </div>
      {/if}

      <!-- Getting Started -->
      {#if !discoveries && !isLoading}
        <Card class="p-8 text-center">
          <Icon name="search" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 class="text-xl font-semibold mb-2">Scientific Discovery Tracking</h3>
          <p class="text-muted-foreground mb-6">
            Select filters above to explore the latest scientific breakthroughs and research findings
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div class="text-left">
              <h4 class="font-medium mb-2">🔬 Multi-Field Coverage</h4>
              <p class="text-sm text-muted-foreground">Physics, biology, medicine, and more</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">⏰ Real-Time Updates</h4>
              <p class="text-sm text-muted-foreground">Latest discoveries as they happen</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">📊 Significance Ratings</h4>
              <p class="text-sm text-muted-foreground">Understand the impact of each discovery</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">🎓 Educational Context</h4>
              <p class="text-sm text-muted-foreground">Learn why each discovery matters</p>
            </div>
          </div>
        </Card>
      {/if}
    </div>
  </div>
</div> 