<script lang="ts">
  import { onMount } from 'svelte';
  import { trendingTopics, filteredTrendingTopics, enhancedActions } from '$lib/stores/enhancedStore';
  import type { TrendingTopic } from '$lib/types';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface Props {
    category?: string;
    limit?: number;
    onTopicSelect?: (topic: string) => void;
  }

  let { 
    category = 'general', 
    limit = 5, 
    onTopicSelect = () => {} 
  }: Props = $props();

  let isLoading = $state(false);
  let error = $state('');
  let lastUpdated = $state<Date | null>(null);
  let autoRefresh = $state(true);
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let currentLimit = $state(limit);

  // Reactive filtered topics
  let topics = $derived($filteredTrendingTopics.slice(0, currentLimit));

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
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-info';
  }

  function getScoreIcon(score: number): string {
    if (score >= 80) return '🔥';
    if (score >= 60) return '📈';
    return '💡';
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
  <div class="card-body p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-2xl">📊</span>
        <h3 class="card-title text-lg">Trending Topics</h3>
        {#if category !== 'general'}
          <div class="badge badge-primary badge-sm">{category}</div>
        {/if}
      </div>
      
      <div class="flex items-center gap-2">
        {#if lastUpdated}
          <span class="text-xs text-base-content/60">
            {formatTimeAgo(lastUpdated)}
          </span>
        {/if}
        
        <Button
          variant="ghost"
          size="sm"
          onclick={fetchTrendingTopics}
          disabled={isLoading}
          class="btn-circle btn-xs"
        >
          <span class="text-sm {isLoading ? 'animate-spin' : ''}">🔄</span>
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    {#if isLoading && topics.length === 0}
      <div class="flex items-center justify-center py-8">
        <div class="loading loading-spinner loading-md"></div>
        <span class="ml-2">Finding trending topics...</span>
      </div>
    {/if}

    <!-- Error State -->
    {#if error}
      <div class="alert alert-error mb-4">
        <span class="text-sm">⚠️ {error}</span>
        <Button variant="ghost" size="sm" onclick={fetchTrendingTopics}>
          Retry
        </Button>
      </div>
    {/if}

    <!-- Topics List -->
    {#if topics.length > 0}
      <div class="space-y-3">
        {#each topics as topic (topic.topic)}
          <div 
            class="p-3 rounded-lg border border-base-300 hover:border-primary hover:bg-base-200 cursor-pointer transition-all duration-200 group"
            onclick={() => handleTopicClick(topic)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && handleTopicClick(topic)}
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">{getScoreIcon(topic.score)}</span>
                  <h4 class="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                    {topic.topic}
                  </h4>
                </div>
                
                {#if topic.relatedKeywords.length > 0}
                  <div class="flex flex-wrap gap-1 mt-2">
                    {#each topic.relatedKeywords.slice(0, 3) as keyword}
                      <span class="badge badge-ghost badge-xs">{keyword}</span>
                    {/each}
                  </div>
                {/if}
              </div>
              
              <div class="flex flex-col items-end gap-1 ml-2">
                <span class="text-xs font-bold {getScoreColor(topic.score)}">
                  {topic.score}
                </span>
                {#if topic.sources.length > 0}
                  <span class="text-xs text-base-content/60">
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
            size="sm"
            onclick={() => currentLimit = Math.min(currentLimit + 5, $trendingTopics.length)}
          >
            View More ({$trendingTopics.length - currentLimit} remaining)
          </Button>
        </div>
      {/if}
    {:else if !isLoading && !error}
      <div class="text-center py-8 text-base-content/60">
        <span class="text-4xl mb-2 block">📈</span>
        <p class="text-sm">No trending topics found</p>
        <Button variant="ghost" size="sm" onclick={fetchTrendingTopics} class="mt-2">
          Try Again
        </Button>
      </div>
    {/if}

    <!-- Auto-refresh Toggle -->
    <div class="mt-4 pt-3 border-t border-base-300">
      <label class="flex items-center gap-2 cursor-pointer">
        <input 
          type="checkbox" 
          class="checkbox checkbox-xs" 
          bind:checked={autoRefresh}
          onchange={() => {
            if (autoRefresh) {
              refreshInterval = setInterval(fetchTrendingTopics, 5 * 60 * 1000);
            } else if (refreshInterval) {
              clearInterval(refreshInterval);
            }
          }}
        />
        <span class="text-xs text-base-content/70">Auto-refresh (5min)</span>
      </label>
    </div>
  </div>
</Card>

<style>
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
  }
  
  .group:hover {
    animation: pulse-glow 2s infinite;
  }
</style> 