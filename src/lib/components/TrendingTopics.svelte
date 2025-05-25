<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import type { TrendingTopic } from '$lib/types';

  let category = 'general';
  let limit = 5;
  let onTopicSelect = (topic: string) => {};

  let trendingTopics: TrendingTopic[] = $state([]);
  let isLoading = $state(false);
  let error = $state('');
  let lastUpdated: Date | null = $state(null);
  let autoRefresh = $state(true);
  let refreshInterval: NodeJS.Timeout | null = null;

  const categories = [
    { id: 'general', name: 'General', icon: 'globe' },
    { id: 'technology', name: 'Technology', icon: 'cpu' },
    { id: 'science', name: 'Science', icon: 'atom' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'health', name: 'Health', icon: 'heart' },
    { id: 'education', name: 'Education', icon: 'book' }
  ];

  let selectedCategory = $state(category);

  onMount(() => {
    fetchTrendingTopics();
    
    if (autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  async function fetchTrendingTopics() {
    isLoading = true;
    error = '';
    
    try {
      const response = await fetch(`/api/trending?category=${selectedCategory}&limit=${limit}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          trendingTopics = result.data;
          lastUpdated = new Date();
        } else {
          error = result.error || 'Failed to fetch trending topics';
        }
      } else {
        error = 'Failed to fetch trending topics';
      }
    } catch (err) {
      error = 'Network error occurred';
      console.error('Trending topics fetch error:', err);
    } finally {
      isLoading = false;
    }
  }

  function handleTopicClick(topic: TrendingTopic) {
    // Track topic interaction for analytics
    // TODO: Fix TypeScript issue with trackTopicInteraction
    // const { trackTopicInteraction } = enhancedActions;
    // trackTopicInteraction(topic.topic);
    onTopicSelect(topic.topic);
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-blue-500';
  }

  function getScoreIcon(score: number): string {
    if (score >= 80) return 'zap';
    if (score >= 60) return 'trending';
    return 'star';
  }

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function startAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    refreshInterval = setInterval(() => {
      fetchTrendingTopics();
    }, 5 * 60 * 1000); // Refresh every 5 minutes
  }

  function stopAutoRefresh() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }

  function handleCategoryChange(newCategory: string) {
    selectedCategory = newCategory;
    fetchTrendingTopics();
  }

  function handleAutoRefreshToggle() {
    if (autoRefresh) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  }

  // Watch for autoRefresh changes
  $effect(() => {
    if (autoRefresh) {
      handleAutoRefreshToggle();
    }
  });
</script>

<Card class="p-6">
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon name="trending" size={20} class="text-blue-500" />
        <h3 class="text-lg font-semibold">Trending Topics</h3>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onclick={fetchTrendingTopics}
        disabled={isLoading}
      >
        <Icon name="refresh-cw" size={16} class={isLoading ? 'animate-spin' : ''} />
      </Button>
    </div>

    <!-- Category Selector -->
    <div class="flex flex-wrap gap-2">
      {#each categories as cat}
        <button
          class="px-3 py-1 text-xs rounded-full border transition-colors {selectedCategory === cat.id 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-background hover:bg-muted border-border'}"
          onclick={() => handleCategoryChange(cat.id)}
        >
          <Icon name={cat.icon} size={12} class="inline mr-1" />
          {cat.name}
        </button>
      {/each}
    </div>

    <!-- Error Display -->
    {#if error}
      <div class="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div class="flex items-center gap-2 text-destructive text-sm">
          <Icon name="alert-circle" size={16} />
          <span>{error}</span>
        </div>
      </div>
    {/if}

    <!-- Loading State -->
    {#if isLoading && trendingTopics.length === 0}
      <div class="space-y-3">
        {#each Array(limit) as _}
          <div class="animate-pulse">
            <div class="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-muted rounded w-1/2"></div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Trending Topics List -->
    {#if trendingTopics.length > 0}
      <div class="space-y-3">
        {#each trendingTopics as topic}
          <button
            class="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
            onclick={() => handleTopicClick(topic)}
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name={getScoreIcon(topic.score)} size={14} class={getScoreColor(topic.score)} />
                  <span class="font-medium text-sm truncate">{topic.topic}</span>
                </div>
                
                <div class="flex items-center gap-3 text-xs text-muted-foreground">
                  <span class={getScoreColor(topic.score)}>
                    Score: {topic.score}
                  </span>
                  <span>
                    {topic.sources.length} sources
                  </span>
                  <span>
                    {formatTimeAgo(topic.lastUpdated)}
                  </span>
                </div>

                {#if topic.relatedKeywords.length > 0}
                  <div class="flex flex-wrap gap-1 mt-2">
                    {#each topic.relatedKeywords.slice(0, 3) as keyword}
                      <span class="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                        {keyword}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>
              
              <Icon name="arrow-right" size={14} class="text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </button>
        {/each}
      </div>
    {/if}

    <!-- Auto-refresh Toggle -->
    <div class="flex items-center justify-between pt-3 border-t">
      <div class="flex items-center gap-2">
        <input 
          type="checkbox" 
          bind:checked={autoRefresh}
          id="auto-refresh"
          class="rounded"
        />
        <label for="auto-refresh" class="text-sm text-muted-foreground">
          Auto-refresh (5min)
        </label>
      </div>
      
      {#if lastUpdated}
        <span class="text-xs text-muted-foreground">
          Updated {formatTimeAgo(lastUpdated)}
        </span>
      {/if}
    </div>
  </div>
</Card> 