<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';

  function goHome() {
    goto('/');
  }

  function goDashboard() {
    const auth = localStorage.getItem('cogniZapAuth');
    if (auth) {
      goto('/dashboard');
    } else {
      goto('/auth/login');
    }
  }

  function goBack() {
    history.back();
  }

  let errorCode = $derived($page.status || 404);
  let errorMessage = $derived($page.error?.message || 'Page not found');
  
  let isNotFound = $derived(errorCode === 404);
</script>

<svelte:head>
  <title>{errorCode} - CogniZap</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
  <div class="text-center space-y-8 max-w-md">
    
    <!-- Logo -->
    <div class="flex items-center justify-center gap-2 mb-8">
      <Icon name="zap" size={32} className="text-primary" />
      <span class="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
        CogniZap
      </span>
    </div>

    <!-- Error Icon and Code -->
    <div class="space-y-4">
      {#if isNotFound}
        <div class="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
          <Icon name="search" size={48} className="text-muted-foreground" />
        </div>
        <div class="space-y-2">
          <h1 class="text-6xl font-bold text-primary">404</h1>
          <h2 class="text-2xl font-semibold">Page Not Found</h2>
          <p class="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      {:else}
        <div class="w-24 h-24 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <Icon name="alert-triangle" size={48} className="text-destructive" />
        </div>
        <div class="space-y-2">
          <h1 class="text-6xl font-bold text-destructive">{errorCode}</h1>
          <h2 class="text-2xl font-semibold">Something went wrong</h2>
          <p class="text-muted-foreground">
            {errorMessage}
          </p>
        </div>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onclick={goHome} class="flex-1 sm:flex-none">
          <Icon name="home" size={16} className="mr-2" />
          Go Home
        </Button>
        <Button variant="outline" onclick={goDashboard} class="flex-1 sm:flex-none">
          <Icon name="layout-dashboard" size={16} className="mr-2" />
          Dashboard
        </Button>
      </div>
      
      <Button variant="ghost" onclick={goBack} class="w-full">
        <Icon name="arrow-left" size={16} className="mr-2" />
        Go Back
      </Button>
    </div>

    <!-- Helpful Links -->
    {#if isNotFound}
      <div class="pt-8 border-t">
        <p class="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <button onclick={() => goto('/auth/login')} class="text-primary hover:underline">
            Login
          </button>
          <button onclick={() => goto('/auth/signup')} class="text-primary hover:underline">
            Sign Up
          </button>
          <button onclick={() => goto('/dashboard')} class="text-primary hover:underline">
            Dashboard
          </button>
          <button onclick={() => goto('/dashboard/trending')} class="text-primary hover:underline">
            Trending Topics
          </button>
        </div>
      </div>
    {/if}
  </div>
</div> 