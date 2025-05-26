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
  <title>Global Events Tracker - CogniZap</title>
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
            <div class="w-16 h-16 mx-auto rounded-full bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
              <Icon name="globe" size={32} className="text-orange-500" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Global Events Tracker
            </h1>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with worldwide events and their educational context. Learn from current affairs and global developments.
            </p>
            <Badge variant="secondary">
              <Icon name="sparkles" size={12} className="mr-1" />
              Global coverage
            </Badge>
          </div>
        </section>

        <!-- Coming Soon Content -->
        <section class="text-center py-16">
          <div class="max-w-2xl mx-auto space-y-6">
            <div class="w-24 h-24 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
              <Icon name="globe" size={48} className="text-muted-foreground" />
            </div>
            <h2 class="text-2xl font-bold">Coming Soon</h2>
            <p class="text-muted-foreground">
              Global Events Tracker is currently under development. This feature will provide comprehensive 
              coverage of worldwide events with educational context and learning opportunities.
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
            <Icon name="newspaper" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Breaking News</h3>
            <p class="text-sm text-muted-foreground">
              Stay informed with the latest breaking news and global developments.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="map" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Regional Coverage</h3>
            <p class="text-sm text-muted-foreground">
              Comprehensive coverage of events from all continents and regions.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="book-open" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Educational Context</h3>
            <p class="text-sm text-muted-foreground">
              Learn the historical and cultural context behind current events.
            </p>
          </Card>
        </section>
      </div>
    </div>
  </div>
{/if} 