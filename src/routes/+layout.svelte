<script lang="ts">
  import '../app.css';
  import ProfessionalHeader from '$lib/components/ProfessionalHeader.svelte';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

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
  <ProfessionalHeader />
  
  <main class="flex-1">
    {@render children()}
  </main>
</div> 