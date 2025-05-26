<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import TrendingTopics from '$lib/components/TrendingTopics.svelte';
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
  <title>Trending Topics - CogniZap</title>
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
            <div class="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Icon name="trending" size={32} className="text-blue-500" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Real-Time Trending Topics
            </h1>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay ahead of the curve with AI-generated learning content based on the latest trending topics and current events worldwide.
            </p>
            <Badge variant="secondary">
              <Icon name="sparkles" size={12} className="mr-1" />
              Updated every hour
            </Badge>
          </div>
        </section>

        <!-- Trending Topics Component -->
        <TrendingTopics />

        <!-- Features -->
        <section class="mt-16 grid md:grid-cols-3 gap-6">
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="clock" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Real-Time Updates</h3>
            <p class="text-sm text-muted-foreground">
              Topics are updated hourly to ensure you're learning from the most current information available.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="globe" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Global Coverage</h3>
            <p class="text-sm text-muted-foreground">
              Trending topics from around the world, covering technology, science, politics, and more.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="zap" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Instant Generation</h3>
            <p class="text-sm text-muted-foreground">
              Click any trending topic to instantly generate personalized flashcards and quizzes.
            </p>
          </Card>
        </section>
      </div>
    </div>
  </div>
{/if} 