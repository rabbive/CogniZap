<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import FeedbackModal from '$lib/components/ui/FeedbackModal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  let showFeedback = $state(false);

  onMount(() => {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  });
</script>

<div class="min-h-screen bg-background text-foreground">
  <main class="flex-1">
    {@render children()}
  </main>
  
  <!-- Floating Feedback Button -->
  <Button 
    onclick={() => showFeedback = true}
    class="fixed bottom-6 right-6 rounded-full shadow-lg z-40 bg-primary hover:bg-primary/90"
    size="icon"
  >
    <Icon name="message-circle" size={20} />
  </Button>
  
  <!-- Feedback Modal -->
  <FeedbackModal bind:isOpen={showFeedback} onClose={() => showFeedback = false} />
</div> 