<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';

  let isAuthenticated = $state(false);

  onMount(() => {
    const auth = localStorage.getItem('cogniZapAuth');
    if (!auth) {
      goto('/auth/login');
      return;
    }
    isAuthenticated = true;
  });

  function goBack() {
    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Science Breakthrough Monitor - CogniZap</title>
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
      <div class="container mx-auto px-4 py-8 max-w-6xl">
        
        <!-- Header Section -->
        <section class="mb-8">
          <div class="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onclick={goBack}>
              <Icon name="arrow-left" size={16} className="mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <!-- Hero Section -->
          <div class="text-center space-y-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center">
              <Icon name="search" size={32} className="text-cyan-500" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Science Breakthrough Monitor
            </h1>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the latest research findings and scientific discoveries from around the world. Stay at the forefront of scientific knowledge.
            </p>
            <Badge variant="secondary">
              <Icon name="sparkles" size={12} className="mr-1" />
              Latest discoveries
            </Badge>
          </div>
        </section>

        <!-- Coming Soon Content -->
        <section class="text-center py-16">
          <div class="max-w-2xl mx-auto space-y-6">
            <div class="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
              <Icon name="search" size={48} className="text-muted-foreground" />
            </div>
            <h2 class="text-2xl font-bold">Coming Soon</h2>
            <p class="text-muted-foreground">
              Science Breakthrough Monitor is currently under development. This feature will track the latest 
              scientific discoveries and research findings from leading institutions worldwide.
            </p>
            <Button onclick={goBack}>
              <Icon name="arrow-left" size={16} className="mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </section>

        <!-- Features Preview -->
        <section class="mt-16 grid md:grid-cols-3 gap-6">
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="microscope" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Research Papers</h3>
            <p class="text-sm text-muted-foreground">
              Access the latest peer-reviewed research papers and scientific publications.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="atom" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Breakthrough Discoveries</h3>
            <p class="text-sm text-muted-foreground">
              Stay informed about groundbreaking discoveries across all scientific fields.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="graduation-cap" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Educational Insights</h3>
            <p class="text-sm text-muted-foreground">
              Learn the implications and applications of new scientific discoveries.
            </p>
          </Card>
        </section>
      </div>
    </div>
  </div>
{/if} 