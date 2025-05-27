<script lang="ts">
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import Icon from './Icons.svelte';
  import type { Snippet } from 'svelte';
  
  interface Props {
    children: Snippet;
    fallback?: Snippet<[Error]>;
  }
  
  let { children, fallback }: Props = $props();
  let hasError = $state(false);
  let error = $state<Error | null>(null);
  
  onMount(() => {
    // Listen for unhandled errors
    const handleError = (event: ErrorEvent) => {
      hasError = true;
      error = new Error(event.message);
      console.error('Error caught by boundary:', event.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  });
  
  function retry() {
    hasError = false;
    error = null;
  }
  
  function reportError() {
    // This could send error details to your logging service
    const errorDetails = {
      message: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('Error reported:', errorDetails);
    // TODO: Send to logging service
  }
</script>

{#if hasError && error}
  {#if fallback}
    {@render fallback(error)}
  {:else}
    <div class="min-h-[400px] flex items-center justify-center">
      <div class="text-center space-y-6 max-w-md">
        <div class="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <Icon name="alert-triangle" size={32} className="text-destructive" />
        </div>
        
        <div class="space-y-2">
          <h3 class="text-lg font-semibold">Something went wrong</h3>
          <p class="text-muted-foreground text-sm">
            We're sorry, but something unexpected happened. Please try again.
          </p>
        </div>
        
        <div class="flex gap-3 justify-center">
          <Button variant="outline" onclick={retry}>
            <Icon name="refresh-cw" size={16} className="mr-2" />
            Try Again
          </Button>
          <Button variant="ghost" onclick={reportError}>
            <Icon name="bug" size={16} className="mr-2" />
            Report Issue
          </Button>
        </div>
        
        {#if error.message}
          <details class="text-left">
            <summary class="text-xs text-muted-foreground cursor-pointer">Error Details</summary>
            <pre class="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-auto">{error.message}</pre>
          </details>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  {@render children()}
{/if} 