<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';

  let selectedRegion = $state('global');
  let selectedCategory = $state('all');
  let isLoading = $state(false);
  let events: any = $state(null);
  let error = $state('');

  const regions = [
    { id: 'global', name: 'Global', icon: 'globe' },
    { id: 'north-america', name: 'North America', icon: 'map-pin' },
    { id: 'europe', name: 'Europe', icon: 'map-pin' },
    { id: 'asia', name: 'Asia', icon: 'map-pin' },
    { id: 'africa', name: 'Africa', icon: 'map-pin' },
    { id: 'south-america', name: 'South America', icon: 'map-pin' },
    { id: 'oceania', name: 'Oceania', icon: 'map-pin' }
  ];

  const categories = [
    { id: 'all', name: 'All Events', icon: 'calendar' },
    { id: 'politics', name: 'Politics', icon: 'users' },
    { id: 'economics', name: 'Economics', icon: 'trending-up' },
    { id: 'technology', name: 'Technology', icon: 'cpu' },
    { id: 'environment', name: 'Environment', icon: 'leaf' },
    { id: 'health', name: 'Health', icon: 'heart' },
    { id: 'education', name: 'Education', icon: 'book' }
  ];

  onMount(() => {
    fetchGlobalEvents();
  });

  async function fetchGlobalEvents() {
    isLoading = true;
    error = '';
    
    try {
      const response = await fetch('/api/global-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          region: selectedRegion,
          category: selectedCategory,
          generateEducationalContent: true 
        })
      });

      if (response.ok) {
        events = await response.json();
      } else {
        error = 'Failed to fetch global events';
      }
    } catch (err) {
      error = 'Network error occurred';
    } finally {
      isLoading = false;
    }
  }

  function handleFilterChange() {
    fetchGlobalEvents();
  }

  function getEventIcon(category: string): string {
    const categoryMap: Record<string, string> = {
      politics: 'users',
      economics: 'trending-up',
      technology: 'cpu',
      environment: 'leaf',
      health: 'heart',
      education: 'book',
      default: 'calendar'
    };
    return categoryMap[category] || categoryMap.default;
  }

  function getEventColor(category: string): string {
    const colorMap: Record<string, string> = {
      politics: 'text-blue-500',
      economics: 'text-green-500',
      technology: 'text-purple-500',
      environment: 'text-emerald-500',
      health: 'text-red-500',
      education: 'text-orange-500',
      default: 'text-gray-500'
    };
    return colorMap[category] || colorMap.default;
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
  <title>Global Events Tracker - CogniZap</title>
</svelte:head>

<div class="flex min-h-screen bg-background">
  <ProfessionalSidebar class="hidden lg:block" />
  
  <div class="flex-1 overflow-auto">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Icon name="globe" size={32} className="text-orange-500" />
          <h1 class="text-3xl font-bold">Global Events Tracker</h1>
        </div>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay updated with worldwide events and their educational context
        </p>
      </div>

      <!-- Filters -->
      <Card class="p-6 mb-8">
        <div class="space-y-6">
          <!-- Region Filter -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Region</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {#each regions as region}
                <button
                  class="p-3 rounded-lg border-2 transition-all duration-200 {selectedRegion === region.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}"
                  onclick={() => { selectedRegion = region.id; handleFilterChange(); }}
                >
                  <div class="flex flex-col items-center gap-2">
                    <Icon name={region.icon} size={20} />
                    <span class="text-sm font-medium">{region.name}</span>
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Category Filter -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Category</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {#each categories as category}
                <button
                  class="p-3 rounded-lg border-2 transition-all duration-200 {selectedCategory === category.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'}"
                  onclick={() => { selectedCategory = category.id; handleFilterChange(); }}
                >
                  <div class="flex flex-col items-center gap-2">
                    <Icon name={category.icon} size={20} />
                    <span class="text-sm font-medium">{category.name}</span>
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
          onclick={fetchGlobalEvents}
          disabled={isLoading}
          loading={isLoading}
          loadingText="Fetching events..."
        >
          <Icon name="refresh-cw" size={20} className="mr-2" />
          Refresh Events
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

      <!-- Events Display -->
      {#if events && events.success}
        <div class="space-y-6">
          
          <!-- Current Events -->
          {#if events.data?.currentEvents && events.data.currentEvents.length > 0}
            <div>
              <h2 class="text-2xl font-bold mb-6">Current Events</h2>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {#each events.data.currentEvents as event}
                  <Card class="p-6 hover:shadow-lg transition-shadow">
                    <div class="space-y-4">
                      <!-- Event Header -->
                      <div class="flex items-start justify-between">
                        <div class="flex items-center gap-2">
                          <Icon name={getEventIcon(event.category)} size={20} className={getEventColor(event.category)} />
                          <span class="text-sm font-medium text-muted-foreground capitalize">{event.category}</span>
                        </div>
                        <span class="text-sm text-muted-foreground">{formatDate(event.date)}</span>
                      </div>

                      <!-- Event Title -->
                      <h3 class="text-lg font-semibold leading-tight">{event.title}</h3>

                      <!-- Event Description -->
                      <p class="text-base-content/80 leading-relaxed">{event.description}</p>

                      <!-- Impact Level -->
                      {#if event.impactLevel}
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium">Impact:</span>
                          <div class="flex items-center gap-1">
                            {#each Array(5) as _, i}
                              <div class="w-2 h-2 rounded-full {i < event.impactLevel ? 'bg-primary' : 'bg-muted'}"></div>
                            {/each}
                          </div>
                        </div>
                      {/if}

                      <!-- Educational Context -->
                      {#if event.educationalContext}
                        <div class="bg-muted/30 rounded-lg p-4">
                          <div class="flex items-center gap-2 mb-2">
                            <Icon name="book-open" size={16} className="text-blue-500" />
                            <span class="text-sm font-medium">Educational Context</span>
                          </div>
                          <p class="text-sm text-base-content/80">{event.educationalContext}</p>
                        </div>
                      {/if}

                      <!-- Related Topics -->
                      {#if event.relatedTopics && event.relatedTopics.length > 0}
                        <div class="flex flex-wrap gap-2">
                          {#each event.relatedTopics as topic}
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

          <!-- Learning Opportunities -->
          {#if events.data?.learningOpportunities && events.data.learningOpportunities.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="lightbulb" size={24} className="text-yellow-500" />
                <h3 class="text-xl font-semibold">Learning Opportunities</h3>
              </div>
              <div class="space-y-3">
                {#each events.data.learningOpportunities as opportunity, index}
                  <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p class="text-base-content/80">{opportunity}</p>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}

          <!-- Key Insights -->
          {#if events.data?.keyInsights && events.data.keyInsights.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="eye" size={24} className="text-purple-500" />
                <h3 class="text-xl font-semibold">Key Insights</h3>
              </div>
              <ul class="space-y-2">
                {#each events.data.keyInsights as insight}
                  <li class="flex items-start gap-2">
                    <Icon name="check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                    <span class="text-base-content/80">{insight}</span>
                  </li>
                {/each}
              </ul>
            </Card>
          {/if}

          <!-- Sources -->
          {#if events.data?.sources && events.data.sources.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="link" size={24} className="text-blue-500" />
                <h3 class="text-xl font-semibold">Sources</h3>
              </div>
              <div class="space-y-3">
                {#each events.data.sources as source}
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
      {#if !events && !isLoading}
        <Card class="p-8 text-center">
          <Icon name="globe" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 class="text-xl font-semibold mb-2">Global Events Tracking</h3>
          <p class="text-muted-foreground mb-6">
            Select filters above to explore current global events and their educational significance
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div class="text-left">
              <h4 class="font-medium mb-2">🌍 Regional Focus</h4>
              <p class="text-sm text-muted-foreground">Filter events by geographic region</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">📂 Category Filter</h4>
              <p class="text-sm text-muted-foreground">Focus on specific types of events</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">📚 Educational Context</h4>
              <p class="text-sm text-muted-foreground">Learn the significance of each event</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">🔗 Reliable Sources</h4>
              <p class="text-sm text-muted-foreground">Access verified news sources</p>
            </div>
          </div>
        </Card>
      {/if}
    </div>
  </div>
</div> 