<script lang="ts">
  import { onMount } from 'svelte';
  import { trendingTopics, filteredTrendingTopics, enhancedActions } from '$lib/stores/enhancedStore';
  import type { TrendingTopic } from '$lib/types';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';

  interface Props {
    category?: string;
    limit?: number;
    onTopicSelect?: (topic: string) => void;
  }

  export let category = 'general';
  export let limit = 5;
  export let onTopicSelect = () => {};

  let isLoading = false;
  let error = '';
  let lastUpdated: Date | null = null;
  let autoRefresh = true;
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let currentLimit = limit;

  // Reactive filtered topics
  $: topics = $filteredTrendingTopics.slice(0, currentLimit);

  onMount(() => {
    fetchTrendingTopics();
    
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        fetchTrendingTopics();
      }, 5 * 60 * 1000); // Refresh every 5 minutes
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
      const response = await fetch(`/api/trending?category=${category}&limit=${currentLimit * 2}`);
      const result = await response.json();

      if (result.success) {
        result.data.forEach((topic: TrendingTopic) => {
          enhancedActions.addTrendingTopic(topic);
        });
        lastUpdated = new Date();
      } else {
        error = result.error || 'Failed to fetch trending topics';
      }
    } catch (err) {
      error = 'Network error. Please check your connection.';
      console.error('Trending topics error:', err);
    } finally {
      isLoading = false;
    }
  }

  function handleTopicClick(topic: TrendingTopic) {
    enhancedActions.trackTopicInteraction(topic.topic);
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
</script>

<Card class="h-full">
  <div class="p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <Icon name="trending" size={20} className="text-primary" />
        <h3 class="text-lg font-semibold">Trending Topics</h3>
        {#if category !== 'general'}
          <span class="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">{category}</span>
        {/if}
      </div>
      
      <div class="flex items-center gap-2">
        {#if lastUpdated}
          <span class="text-xs text-muted-foreground">
            {formatTimeAgo(lastUpdated)}
          </span>
        {/if}
        
        <Button
          variant="ghost"
          size="sm"
          onclick={fetchTrendingTopics}
          disabled={isLoading}
        >
          <Icon name="refresh" size={16} className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    {#if isLoading && topics.length === 0}
      <div class="flex items-center justify-center py-8">
        <Icon name="refresh" size={20} className="animate-spin mr-2" />
        <span>Finding trending topics...</span>
      </div>
    {/if}

    <!-- Error State -->
    {#if error}
      <div class="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-md">
        <div class="flex items-center justify-between">
          <span class="text-sm text-destructive">⚠️ {error}</span>
          <Button variant="ghost" size="sm" onclick={fetchTrendingTopics}>
            Retry
          </Button>
        </div>
      </div>
    {/if}

    <!-- Topics List -->
    {#if topics.length > 0}
      <div class="space-y-3">
        {#each topics as topic (topic.topic)}
          <div 
            class="p-3 rounded-lg border border-border hover:border-primary hover:bg-muted/50 cursor-pointer transition-all duration-200 group"
            onclick={() => handleTopicClick(topic)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && handleTopicClick(topic)}
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <Icon name={getScoreIcon(topic.score)} size={16} className={getScoreColor(topic.score)} />
                  <h4 class="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                    {topic.topic}
                  </h4>
                </div>
                
                {#if topic.relatedKeywords.length > 0}
                  <div class="flex flex-wrap gap-1 mt-2">
                    {#each topic.relatedKeywords.slice(0, 3) as keyword}
                      <span class="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">{keyword}</span>
                    {/each}
                  </div>
                {/if}
              </div>
              
              <div class="flex flex-col items-end gap-1 ml-2">
                <span class="text-xs font-bold {getScoreColor(topic.score)}">
                  {topic.score}
                </span>
                {#if topic.sources.length > 0}
                  <span class="text-xs text-muted-foreground">
                    {topic.sources.length} sources
                  </span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- View More Button -->
      {#if $trendingTopics.length > currentLimit}
        <div class="mt-4 text-center">
          <Button 
            variant="ghost" 
            onclick={() => currentLimit += 5}
          >
            View More Topics
          </Button>
        </div>
      {/if}
    {:else if !isLoading}
      <div class="text-center py-8 text-muted-foreground">
        <Icon name="search" size={24} className="mx-auto mb-2 opacity-50" />
        <p>No trending topics found</p>
        <Button variant="ghost" size="sm" onclick={fetchTrendingTopics} class="mt-2">
          Refresh
        </Button>
      </div>
    {/if}

    <!-- Auto-refresh Toggle -->
    <div class="mt-4 pt-4 border-t border-border">
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Auto-refresh</span>
        <label class="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            bind:checked={autoRefresh}
            onchange={() => {
              if (autoRefresh) {
                refreshInterval = setInterval(() => {
                  fetchTrendingTopics();
                }, 5 * 60 * 1000);
              } else if (refreshInterval) {
                clearInterval(refreshInterval);
              }
            }}
            class="rounded"
          />
          <span class="text-xs">{autoRefresh ? 'On' : 'Off'}</span>
        </label>
      </div>
    </div>
  </div>
</Card> 