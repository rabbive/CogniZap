<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';

  let query = $state('');
  let isAnalyzing = $state(false);
  let results: any = $state(null);
  let error = $state('');

  async function analyzeQuery() {
    if (!query.trim()) return;
    
    isAnalyzing = true;
    error = '';
    
    try {
      const response = await fetch('/api/research-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        results = await response.json();
      } else {
        error = 'Failed to analyze query';
      }
    } catch (err) {
      error = 'Network error occurred';
    } finally {
      isAnalyzing = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      analyzeQuery();
    }
  }
</script>

<svelte:head>
  <title>Research Assistant - CogniZap</title>
</svelte:head>

<div class="flex min-h-screen bg-background">
  <ProfessionalSidebar class="hidden lg:block" />
  
  <div class="flex-1 overflow-auto">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Icon name="brain" size={32} className="text-purple-500" />
          <h1 class="text-3xl font-bold">AI Research Assistant</h1>
        </div>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get multi-perspective analysis with academic, industry, news, and social viewpoints on any topic
        </p>
      </div>

      <!-- Query Input -->
      <Card class="p-6 mb-8">
        <div class="space-y-4">
          <Input
            label="Research Query"
            placeholder="e.g., What are the implications of AI in healthcare?"
            bind:value={query}
            onkeydown={handleKeydown}
            description="Enter your research question for comprehensive analysis"
          />
          
          <Button 
            onclick={analyzeQuery}
            disabled={!query.trim() || isAnalyzing}
            loading={isAnalyzing}
            loadingText="Analyzing..."
            class="w-full"
          >
            <Icon name="search" size={20} className="mr-2" />
            Analyze Query
          </Button>
        </div>
      </Card>

      <!-- Error Display -->
      {#if error}
        <Card class="p-4 mb-6 border-destructive bg-destructive/5">
          <div class="flex items-center gap-2 text-destructive">
            <Icon name="alert-circle" size={20} />
            <span>{error}</span>
          </div>
        </Card>
      {/if}

      <!-- Results -->
      {#if results}
        <div class="space-y-6">
          <h2 class="text-2xl font-bold">Analysis Results</h2>
          
          <!-- Academic Perspective -->
          {#if results.data?.academicPerspective}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="book" size={24} className="text-blue-500" />
                <h3 class="text-xl font-semibold">Academic Perspective</h3>
              </div>
              <p class="text-base-content/80 leading-relaxed">
                {results.data.academicPerspective}
              </p>
            </Card>
          {/if}

          <!-- Industry Perspective -->
          {#if results.data?.industryPerspective}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="briefcase" size={24} className="text-green-500" />
                <h3 class="text-xl font-semibold">Industry Perspective</h3>
              </div>
              <p class="text-base-content/80 leading-relaxed">
                {results.data.industryPerspective}
              </p>
            </Card>
          {/if}

          <!-- News Perspective -->
          {#if results.data?.newsPerspective}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="newspaper" size={24} className="text-orange-500" />
                <h3 class="text-xl font-semibold">News & Media Perspective</h3>
              </div>
              <p class="text-base-content/80 leading-relaxed">
                {results.data.newsPerspective}
              </p>
            </Card>
          {/if}

          <!-- Social Perspective -->
          {#if results.data?.socialPerspective}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="users" size={24} className="text-purple-500" />
                <h3 class="text-xl font-semibold">Social Perspective</h3>
              </div>
              <p class="text-base-content/80 leading-relaxed">
                {results.data.socialPerspective}
              </p>
            </Card>
          {/if}

          <!-- Key Insights -->
          {#if results.data?.keyInsights}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="lightbulb" size={24} className="text-yellow-500" />
                <h3 class="text-xl font-semibold">Key Insights</h3>
              </div>
              <ul class="space-y-2">
                {#each results.data.keyInsights as insight}
                  <li class="flex items-start gap-2">
                    <Icon name="check" size={16} className="text-green-500 mt-1 flex-shrink-0" />
                    <span class="text-base-content/80">{insight}</span>
                  </li>
                {/each}
              </ul>
            </Card>
          {/if}

          <!-- Sources -->
          {#if results.data?.sources && results.data.sources.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="link" size={24} className="text-blue-500" />
                <h3 class="text-xl font-semibold">Sources</h3>
              </div>
              <div class="space-y-3">
                {#each results.data.sources as source}
                  <div class="border-l-4 border-primary pl-4">
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="font-medium text-primary hover:underline"
                    >
                      {source.title}
                    </a>
                    <p class="text-sm text-muted-foreground mt-1">
                      {source.domain} • Reliability: {source.reliability}%
                    </p>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}
        </div>
      {/if}

      <!-- Getting Started -->
      {#if !results && !isAnalyzing}
        <Card class="p-8 text-center">
          <Icon name="search" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 class="text-xl font-semibold mb-2">Ready to Research?</h3>
          <p class="text-muted-foreground mb-6">
            Enter your research question above to get comprehensive analysis from multiple perspectives
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div class="text-left">
              <h4 class="font-medium mb-2">📚 Academic Analysis</h4>
              <p class="text-sm text-muted-foreground">Scholarly research and theoretical frameworks</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">💼 Industry Insights</h4>
              <p class="text-sm text-muted-foreground">Business applications and market trends</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">📰 News Coverage</h4>
              <p class="text-sm text-muted-foreground">Current events and media perspectives</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">👥 Social Discussion</h4>
              <p class="text-sm text-muted-foreground">Public opinion and community insights</p>
            </div>
          </div>
        </Card>
      {/if}
    </div>
  </div>
</div> 