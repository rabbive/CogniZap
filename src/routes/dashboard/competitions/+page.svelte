<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';

  let isAuthenticated = $state(false);
  let competitions = $state([
    {
      id: 1,
      title: "Global Science Quiz",
      description: "Test your knowledge of recent scientific discoveries",
      participants: 1247,
      timeLeft: "2 days",
      difficulty: "Intermediate",
      prize: "Premium Access",
      category: "Science",
      status: "active"
    },
    {
      id: 2,
      title: "AI & Technology Challenge",
      description: "Explore the latest in artificial intelligence and tech trends",
      participants: 892,
      timeLeft: "5 days",
      difficulty: "Advanced",
      prize: "Certificate",
      category: "Technology",
      status: "active"
    },
    {
      id: 3,
      title: "Climate Change Awareness",
      description: "Learn about environmental issues and solutions",
      participants: 2156,
      timeLeft: "1 week",
      difficulty: "Beginner",
      prize: "Badge",
      category: "Environment",
      status: "active"
    }
  ]);

  let leaderboard = $state([
    { rank: 1, name: "Alex Chen", score: 2847, badge: "🏆" },
    { rank: 2, name: "Sarah Johnson", score: 2756, badge: "🥈" },
    { rank: 3, name: "Mike Rodriguez", score: 2689, badge: "🥉" },
    { rank: 4, name: "Emma Wilson", score: 2543, badge: "" },
    { rank: 5, name: "David Kim", score: 2487, badge: "" }
  ]);

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

  function joinCompetition(competitionId: number) {
    // Handle joining competition
    console.log('Joining competition:', competitionId);
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'Beginner': return 'text-green-500';
      case 'Intermediate': return 'text-yellow-500';
      case 'Advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  function getCategoryColor(category: string) {
    switch (category) {
      case 'Science': return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'Technology': return 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
      case 'Environment': return 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300';
    }
  }
</script>

<svelte:head>
  <title>Learning Competitions - CogniZap</title>
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
            <div class="w-16 h-16 mx-auto rounded-full bg-yellow-50 dark:bg-yellow-950 flex items-center justify-center">
              <Icon name="star" size={32} className="text-yellow-500" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
              Learning Competitions
            </h1>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Challenge yourself and compete with learners from around the world. Earn badges, certificates, and climb the leaderboards!
            </p>
          </div>
        </section>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- Active Competitions -->
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-bold">Active Competitions</h3>
              <Badge variant="secondary">
                <Icon name="users" size={12} className="mr-1" />
                {competitions.reduce((sum, comp) => sum + comp.participants, 0)} participants
              </Badge>
            </div>

            <div class="space-y-4">
              {#each competitions as competition}
                <Card class="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h4 class="text-lg font-semibold">{competition.title}</h4>
                        <Badge variant="outline" class={getCategoryColor(competition.category)}>
                          {competition.category}
                        </Badge>
                      </div>
                      <p class="text-muted-foreground mb-3">{competition.description}</p>
                      
                      <div class="flex items-center gap-4 text-sm text-muted-foreground">
                        <div class="flex items-center gap-1">
                          <Icon name="users" size={14} />
                          <span>{competition.participants} participants</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <Icon name="clock" size={14} />
                          <span>{competition.timeLeft} left</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <Icon name="target" size={14} />
                          <span class={getDifficultyColor(competition.difficulty)}>{competition.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="text-right">
                      <div class="text-sm text-muted-foreground mb-2">Prize</div>
                      <Badge variant="secondary">{competition.prize}</Badge>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <Icon name="trophy" size={16} className="text-yellow-500" />
                      <span class="text-sm font-medium">Join to compete for rewards</span>
                    </div>
                    <Button onclick={() => joinCompetition(competition.id)}>
                      <Icon name="play" size={16} className="mr-2" />
                      Join Competition
                    </Button>
                  </div>
                </Card>
              {/each}
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="space-y-6">
            <div class="flex items-center gap-2">
              <Icon name="trophy" size={20} className="text-yellow-500" />
              <h3 class="text-xl font-bold">Global Leaderboard</h3>
            </div>

            <Card class="p-6">
              <div class="space-y-4">
                {#each leaderboard as player}
                  <div class="flex items-center justify-between p-3 rounded-lg {player.rank <= 3 ? 'bg-muted/50' : ''}">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {player.badge || player.rank}
                      </div>
                      <div>
                        <div class="font-medium">{player.name}</div>
                        <div class="text-sm text-muted-foreground">Rank #{player.rank}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold">{player.score.toLocaleString()}</div>
                      <div class="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                {/each}
              </div>
              
              <div class="mt-6 pt-4 border-t">
                <Button variant="outline" class="w-full">
                  <Icon name="list" size={16} className="mr-2" />
                  View Full Leaderboard
                </Button>
              </div>
            </Card>

            <!-- Your Stats -->
            <Card class="p-6">
              <h4 class="font-semibold mb-4 flex items-center gap-2">
                <Icon name="user" size={16} />
                Your Stats
              </h4>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Current Rank</span>
                  <span class="font-medium">#42</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Total Points</span>
                  <span class="font-medium">1,847</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Competitions Won</span>
                  <span class="font-medium">3</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Badges Earned</span>
                  <span class="font-medium">7</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <!-- Features -->
        <section class="mt-16 grid md:grid-cols-3 gap-6">
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="trophy" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Earn Rewards</h3>
            <p class="text-sm text-muted-foreground">
              Win badges, certificates, and premium access by competing in challenges.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="users" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Global Community</h3>
            <p class="text-sm text-muted-foreground">
              Connect with learners worldwide and see how you rank against the best.
            </p>
          </Card>
          
          <Card class="p-6 text-center border-2 hover:border-primary/20 transition-colors">
            <Icon name="trending-up" size={24} className="text-primary mx-auto mb-4" />
            <h3 class="font-semibold mb-2">Track Progress</h3>
            <p class="text-sm text-muted-foreground">
              Monitor your improvement and climb the leaderboards over time.
            </p>
          </Card>
        </section>
      </div>
    </div>
  </div>
{/if} 