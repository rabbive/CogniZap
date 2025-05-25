<script lang="ts">
  import { cn } from "$lib/utils";
  import Button from "$lib/components/ui/Button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Icon from "$lib/components/ui/Icons.svelte";
  import { onMount } from "svelte";

  let className = "";

  let isDark = $state(false);
  let isMenuOpen = $state(false);
  let searchQuery = $state("");
  let notifications = $state([
    { id: 1, title: "New trending topic available", time: "2m ago", unread: true },
    { id: 2, title: "Quiz completed successfully", time: "1h ago", unread: false },
    { id: 3, title: "Weekly learning report ready", time: "3h ago", unread: true }
  ]);

  const unreadCount = $derived(notifications.filter(n => n.unread).length);

  onMount(() => {
    // Check for saved theme preference or default to light mode
    isDark = localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    updateTheme();
  });

  function toggleTheme() {
    isDark = !isDark;
    updateTheme();
  }

  function updateTheme() {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Implement search functionality
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<header class={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
  <div class="container flex h-16 items-center justify-between px-4">
    <!-- Logo and Brand -->
    <div class="flex items-center space-x-4">
      <Button variant="ghost" size="icon" class="md:hidden" onclick={() => isMenuOpen = !isMenuOpen}>
        <Icon name="menu" size={20} />
      </Button>
      
      <a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <div class="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
          <Icon name="zap" size={20} class="text-primary-foreground" />
        </div>
        <span class="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          CogniZap
        </span>
      </a>
    </div>

    <!-- Navigation (Desktop) -->
    <nav class="hidden md:flex items-center space-x-6">
      <a href="/" class="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <Icon name="bookmark" size={16} />
        <span>Learn</span>
      </a>
      <a href="/trending" class="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <Icon name="trending" size={16} />
        <span>Trending</span>
      </a>
      <a href="/research" class="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <Icon name="brain" size={16} />
        <span>Research</span>
      </a>
    </nav>

    <!-- Search Bar -->
    <div class="hidden sm:flex items-center space-x-2 flex-1 max-w-md mx-4">
      <div class="relative w-full">
        <Icon name="search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search topics, flashcards..."
          bind:value={searchQuery}
          onkeydown={handleKeydown}
          class="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-2">
      <!-- Search (Mobile) -->
      <Button variant="ghost" size="icon" class="sm:hidden">
        <Icon name="search" size={20} />
      </Button>

      <!-- Notifications -->
      <div class="relative">
        <Button variant="ghost" size="icon" class="relative">
          <Icon name="bell" size={20} />
          {#if unreadCount > 0}
            <Badge variant="destructive" size="sm" class="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          {/if}
        </Button>
      </div>

      <!-- Theme Toggle -->
      <Button variant="ghost" size="icon" onclick={toggleTheme}>
        {#if isDark}
          <Icon name="sun" size={20} />
        {:else}
          <Icon name="moon" size={20} />
        {/if}
      </Button>

      <!-- Settings -->
      <Button variant="ghost" size="icon">
        <Icon name="settings" size={20} />
      </Button>

      <!-- User Menu -->
      <Button variant="ghost" size="icon">
        <Icon name="user" size={20} />
      </Button>
    </div>
  </div>

  <!-- Mobile Navigation -->
  {#if isMenuOpen}
    <div class="md:hidden border-t bg-background/95 backdrop-blur">
      <nav class="container px-4 py-4 space-y-3">
        <a href="/" class="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
          <Icon name="bookmark" size={16} />
          <span>Learn</span>
        </a>
        <a href="/trending" class="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
          <Icon name="trending" size={16} />
          <span>Trending</span>
        </a>
        <a href="/research" class="flex items-center space-x-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
          <Icon name="brain" size={16} />
          <span>Research</span>
        </a>
        
        <!-- Mobile Search -->
        <div class="pt-3 border-t">
          <div class="relative">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics, flashcards..."
              bind:value={searchQuery}
              onkeydown={handleKeydown}
              class="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>
      </nav>
    </div>
  {/if}
</header> 