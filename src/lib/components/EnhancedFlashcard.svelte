<script lang="ts">
  import type { Flashcard } from '$lib/types';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';

  interface Props {
    flashcard: Flashcard;
    isFlipped?: boolean;
    onFlip?: () => void;
    showEnhancedInfo?: boolean;
  }

  let { 
    flashcard, 
    isFlipped = false, 
    onFlip = () => {}, 
    showEnhancedInfo = true 
  }: Props = $props();

  function getConfidenceColor(score?: number): string {
    if (!score) return 'text-base-content/60';
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  }

  function getFactCheckIcon(status?: string): string {
    switch (status) {
      case 'verified': return '✅';
      case 'disputed': return '⚠️';
      case 'pending': return '🔄';
      default: return '❓';
    }
  }

  function getTrendingIcon(score?: number): string {
    if (!score) return '';
    if (score >= 80) return '🔥';
    if (score >= 60) return '📈';
    return '💡';
  }

  function formatDate(date?: Date): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
</script>

<Card class="h-full cursor-pointer transition-all duration-300 hover:shadow-xl group">
  <div 
    class="card-body p-6 h-full flex flex-col relative"
    onclick={onFlip}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && onFlip()}
  >
    <!-- Enhanced Info Header -->
    {#if showEnhancedInfo && (flashcard.confidenceScore || flashcard.factCheckStatus || flashcard.trendingnessScore)}
      <div class="flex items-center justify-between mb-4 text-xs">
        <div class="flex items-center gap-2">
          {#if flashcard.factCheckStatus}
            <div class="flex items-center gap-1">
              <span>{getFactCheckIcon(flashcard.factCheckStatus)}</span>
              <span class="capitalize">{flashcard.factCheckStatus}</span>
            </div>
          {/if}
          
          {#if flashcard.confidenceScore}
            <div class="flex items-center gap-1">
              <span class="{getConfidenceColor(flashcard.confidenceScore)}">
                {flashcard.confidenceScore}% confident
              </span>
            </div>
          {/if}
        </div>
        
        <div class="flex items-center gap-2">
          {#if flashcard.trendingnessScore}
            <div class="flex items-center gap-1">
              <span>{getTrendingIcon(flashcard.trendingnessScore)}</span>
              <span class="text-primary">{flashcard.trendingnessScore}</span>
            </div>
          {/if}
          
          {#if flashcard.lastUpdated}
            <span class="text-base-content/50">
              {formatDate(flashcard.lastUpdated)}
            </span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    <div class="flex-1 flex flex-col justify-center">
      {#if !isFlipped}
        <!-- Question Side -->
        <div class="text-center">
          <div class="text-lg font-semibold mb-4 leading-relaxed">
            {flashcard.question}
          </div>
          
          <div class="text-sm text-base-content/60 mb-4">
            Click to reveal answer
          </div>
          
          <!-- Difficulty Badge -->
          <div class="flex justify-center">
            <div class="badge badge-outline">
              {#if flashcard.difficulty === 'easy'}
                🟢 Easy
              {:else if flashcard.difficulty === 'medium'}
                🟡 Medium
              {:else if flashcard.difficulty === 'hard'}
                🔴 Hard
              {:else}
                🎯 Mixed
              {/if}
            </div>
          </div>
        </div>
      {:else}
        <!-- Answer Side -->
        <div class="text-center">
          <div class="text-base leading-relaxed mb-4">
            {flashcard.answer}
          </div>
          
          <div class="text-sm text-base-content/60">
            Click to see question
          </div>
        </div>
      {/if}
    </div>

    <!-- Enhanced Footer -->
    {#if showEnhancedInfo && isFlipped}
      <div class="mt-4 pt-4 border-t border-base-300">
        <!-- Related Topics -->
        {#if flashcard.relatedCurrentTopics && flashcard.relatedCurrentTopics.length > 0}
          <div class="mb-3">
            <div class="text-xs font-medium text-base-content/70 mb-1">Related Topics:</div>
            <div class="flex flex-wrap gap-1">
              {#each flashcard.relatedCurrentTopics.slice(0, 3) as topic}
                <span class="badge badge-ghost badge-xs">{topic}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Sources -->
        {#if flashcard.sources && flashcard.sources.length > 0}
          <div class="mb-3">
            <div class="text-xs font-medium text-base-content/70 mb-1">
              Sources ({flashcard.sources.length}):
            </div>
            <div class="space-y-1">
              {#each flashcard.sources.slice(0, 2) as source}
                <div class="text-xs">
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="link link-primary hover:link-accent"
                    onclick={(e) => e.stopPropagation()}
                  >
                    📄 {source.title}
                  </a>
                  <div class="text-base-content/50 ml-4">
                    {source.domain} • {source.reliability}% reliable
                  </div>
                </div>
              {/each}
              
              {#if flashcard.sources.length > 2}
                <div class="text-xs text-base-content/50">
                  +{flashcard.sources.length - 2} more sources
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Topic -->
        {#if flashcard.topic}
          <div class="text-xs text-base-content/50">
            Topic: {flashcard.topic}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Flip Indicator -->
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <span class="text-xs text-base-content/40">
        {isFlipped ? '🔄' : '👆'}
      </span>
    </div>
  </div>
</Card>

<style>
  .card {
    perspective: 1000px;
  }
  
  .card-body {
    transform-style: preserve-3d;
    transition: transform 0.6s;
  }
  
  .group:hover .card-body {
    transform: rotateY(2deg);
  }
</style> 