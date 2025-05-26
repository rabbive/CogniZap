<script lang="ts">
  import { cn } from "$lib/utils";
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Card from "$lib/components/ui/Card.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Icon from "$lib/components/ui/Icons.svelte";

  interface Props {
    class?: string;
  }

  let { class: className = "" }: Props = $props();
  let user = $state<{name: string, email: string} | null>(null);

  onMount(() => {
    const userData = localStorage.getItem('cogniZapUser');
    if (userData) {
      user = JSON.parse(userData);
    }
  });

  let stats = [
    { label: "Cards Generated", value: "1,247", icon: "bookmark", change: "+12%" },
    { label: "Topics Learned", value: "89", icon: "graduation-cap", change: "+5%" },
    { label: "Study Streak", value: "15 days", icon: "star", change: "New!" },
    { label: "Accuracy Rate", value: "94%", icon: "heart", change: "+2%" }
  ];

  let quickActions = [
    { label: "Dashboard", icon: "layout-dashboard", href: "/dashboard", color: "text-blue-500" },
    { label: "Trending Topics", icon: "trending", href: "/dashboard/trending", color: "text-blue-500" },
    { label: "Research Assistant", icon: "lightbulb", href: "/dashboard/research", color: "text-purple-500" },
    { label: "Live Data Learning", icon: "activity", href: "/dashboard/live-data", color: "text-green-500" },
    { label: "Global Events", icon: "globe", href: "/dashboard/global-events", color: "text-orange-500" },
    { label: "Science Tracker", icon: "search", href: "/dashboard/science", color: "text-cyan-500" },
    { label: "Learning Competitions", icon: "star", href: "/dashboard/competitions", color: "text-yellow-500" }
  ];

  let recentActivity = [
    { 
      type: "generation", 
      title: "Generated flashcards on AI Ethics", 
      time: "2 minutes ago",
      icon: "bookmark",
      color: "text-blue-500"
    },
    { 
      type: "trending", 
      title: "Explored trending topic: Climate Change", 
      time: "15 minutes ago",
      icon: "trending",
      color: "text-green-500"
    },
    { 
      type: "research", 
      title: "Completed research on Quantum Computing", 
      time: "1 hour ago",
      icon: "lightbulb",
      color: "text-purple-500"
    },
    { 
      type: "competition", 
      title: "Joined Global Science Quiz", 
      time: "2 hours ago",
      icon: "star",
      color: "text-yellow-500"
    }
  ];

  function navigateTo(href: string) {
    goto(href);
  }

  function logout() {
    localStorage.removeItem('cogniZapAuth');
    localStorage.removeItem('cogniZapUser');
    goto('/');
  }
</script>

<aside class={cn("w-80 h-full bg-background border-r overflow-y-auto scrollbar-thin", className)}>
  <div class="p-6 space-y-6">
    
    <!-- Header with Logo and User -->
    <div class="space-y-4">
      <div class="flex items-center gap-2 pb-4 border-b">
        <Icon name="zap" size={24} className="text-primary" />
        <span class="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          CogniZap
        </span>
      </div>
      
      {#if user}
        <div class="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Icon name="user" size={20} className="text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{user.name}</p>
            <p class="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onclick={logout}>
            <Icon name="log-out" size={16} />
          </Button>
        </div>
      {/if}
    </div>

    <!-- Quick Actions -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Icon name="zap" size={20} className="text-primary" />
        Navigation
      </h3>
      
      <div class="space-y-2">
        {#each quickActions as action}
          <button 
            class="w-full justify-start h-auto p-3 hover:bg-muted/50 flex items-center text-left rounded-md transition-colors bg-transparent border-0"
            onclick={() => navigateTo(action.href)}
          >
            <Icon name={action.icon} size={16} className="mr-3 {action.color}" />
            <span class="flex-1 text-left text-sm">{action.label}</span>
            <Icon name="chevron-right" size={16} className="text-muted-foreground" />
          </button>
        {/each}
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Icon name="activity" size={20} className="text-primary" />
        Quick Stats
      </h3>
      
      <div class="grid grid-cols-2 gap-3">
        {#each stats as stat}
          <Card class="p-4 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
              <Icon name={stat.icon} size={16} className="text-muted-foreground" />
              <Badge variant="secondary" size="sm">{stat.change}</Badge>
            </div>
            <div class="space-y-1">
              <p class="text-2xl font-bold">{stat.value}</p>
              <p class="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        {/each}
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Icon name="clock" size={20} className="text-primary" />
        Recent Activity
      </h3>
      
      <div class="space-y-3">
        {#each recentActivity as activity}
          <div class="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Icon name={activity.icon} size={16} className={activity.color} />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground leading-tight">
                {activity.title}
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        {/each}
      </div>
      
      <button class="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-sm font-medium transition-colors">
        View All Activity
      </button>
    </div>

    <!-- Learning Progress -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <Icon name="star" size={20} className="text-primary" />
        Learning Progress
      </h3>
      
      <Card class="p-4">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Weekly Goal</span>
            <span class="text-sm text-muted-foreground">7/10 topics</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2">
            <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: 70%"></div>
          </div>
          <p class="text-xs text-muted-foreground">
            3 more topics to reach your weekly goal!
          </p>
        </div>
      </Card>
    </div>

    <!-- Achievement Badge -->
    <Card class="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Icon name="heart" size={20} className="text-primary" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium">Learning Streak!</p>
          <p class="text-xs text-muted-foreground">15 days in a row</p>
        </div>
      </div>
    </Card>
  </div>
</aside> 