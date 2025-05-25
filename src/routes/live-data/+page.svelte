<script lang="ts">
  import { onMount } from 'svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Icon from '$lib/components/ui/Icons.svelte';
  import ProfessionalSidebar from '$lib/components/ProfessionalSidebar.svelte';

  let selectedDataType = $state('market');
  let isLoading = $state(false);
  let liveData: any = $state(null);
  let error = $state('');
  let lastUpdated: Date | null = $state(null);

  const dataTypes = [
    { id: 'market', name: 'Market Data', icon: 'trending-up', color: 'text-green-500' },
    { id: 'weather', name: 'Weather', icon: 'cloud', color: 'text-blue-500' },
    { id: 'sports', name: 'Sports', icon: 'trophy', color: 'text-yellow-500' },
    { id: 'economic', name: 'Economic', icon: 'dollar-sign', color: 'text-purple-500' }
  ];

  onMount(() => {
    fetchLiveData();
  });

  async function fetchLiveData() {
    isLoading = true;
    error = '';
    
    try {
      const response = await fetch('/api/live-data-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dataType: selectedDataType,
          generateContent: true 
        })
      });

      if (response.ok) {
        liveData = await response.json();
        lastUpdated = new Date();
      } else {
        error = 'Failed to fetch live data';
      }
    } catch (err) {
      error = 'Network error occurred';
    } finally {
      isLoading = false;
    }
  }

  function handleDataTypeChange(dataType: string) {
    selectedDataType = dataType;
    fetchLiveData();
  }

  function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  }
</script>

<svelte:head>
  <title>Live Data Learning - CogniZap</title>
</svelte:head>

<div class="flex min-h-screen bg-background">
  <ProfessionalSidebar class="hidden lg:block" />
  
  <div class="flex-1 overflow-auto">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Icon name="activity" size={32} className="text-green-500" />
          <h1 class="text-3xl font-bold">Live Data Learning</h1>
        </div>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time market data, weather, sports, and economic insights for educational content generation
        </p>
        {#if lastUpdated}
          <p class="text-sm text-muted-foreground mt-2">
            Last updated: {formatTime(lastUpdated)}
          </p>
        {/if}
      </div>

      <!-- Data Type Selector -->
      <Card class="p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4">Select Data Type</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {#each dataTypes as dataType}
            <button
              class="p-4 rounded-lg border-2 transition-all duration-200 {selectedDataType === dataType.id 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'}"
              onclick={() => handleDataTypeChange(dataType.id)}
            >
              <div class="flex flex-col items-center gap-2">
                <Icon name={dataType.icon} size={24} className={dataType.color} />
                <span class="font-medium">{dataType.name}</span>
              </div>
            </button>
          {/each}
        </div>
      </Card>

      <!-- Refresh Button -->
      <div class="flex justify-center mb-6">
        <Button 
          onclick={fetchLiveData}
          disabled={isLoading}
          loading={isLoading}
          loadingText="Fetching live data..."
        >
          <Icon name="refresh-cw" size={20} className="mr-2" />
          Refresh Data
        </Button>
      </div>

      <!-- Error Display -->
      {#if error}
        <Card class="p-4 mb-6 border-destructive bg-destructive/5">
          <div class="flex items-center gap-2 text-destructive">
            <Icon name="alert-circle" size={20} />
            <span>{error}</span>
          </div>
        </Card>
      {/if}

      <!-- Live Data Display -->
      {#if liveData && liveData.success}
        <div class="space-y-6">
          
          <!-- Current Data -->
          {#if liveData.data?.currentData}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="zap" size={24} className="text-yellow-500" />
                <h3 class="text-xl font-semibold">Current {dataTypes.find(dt => dt.id === selectedDataType)?.name} Data</h3>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each Object.entries(liveData.data.currentData) as [key, value]}
                  <div class="bg-muted/30 rounded-lg p-4">
                    <div class="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div class="text-lg font-semibold">{value}</div>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}

          <!-- Educational Content -->
          {#if liveData.data?.educationalContent}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="book-open" size={24} className="text-blue-500" />
                <h3 class="text-xl font-semibold">Educational Insights</h3>
              </div>
              <div class="prose max-w-none">
                <p class="text-base-content/80 leading-relaxed">
                  {liveData.data.educationalContent}
                </p>
              </div>
            </Card>
          {/if}

          <!-- Key Metrics -->
          {#if liveData.data?.keyMetrics && liveData.data.keyMetrics.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="bar-chart" size={24} className="text-green-500" />
                <h3 class="text-xl font-semibold">Key Metrics</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each liveData.data.keyMetrics as metric}
                  <div class="border-l-4 border-primary pl-4">
                    <div class="font-medium">{metric.name}</div>
                    <div class="text-2xl font-bold text-primary">{metric.value}</div>
                    <div class="text-sm text-muted-foreground">{metric.description}</div>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}

          <!-- Learning Questions -->
          {#if liveData.data?.learningQuestions && liveData.data.learningQuestions.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="help-circle" size={24} className="text-purple-500" />
                <h3 class="text-xl font-semibold">Learning Questions</h3>
              </div>
              <div class="space-y-3">
                {#each liveData.data.learningQuestions as question, index}
                  <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p class="text-base-content/80">{question}</p>
                  </div>
                {/each}
              </div>
            </Card>
          {/if}

          <!-- Data Sources -->
          {#if liveData.data?.sources && liveData.data.sources.length > 0}
            <Card class="p-6">
              <div class="flex items-center gap-2 mb-4">
                <Icon name="link" size={24} className="text-blue-500" />
                <h3 class="text-xl font-semibold">Data Sources</h3>
              </div>
              <div class="space-y-3">
                {#each liveData.data.sources as source}
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

          <!-- Update Frequency -->
          {#if liveData.data?.updateInterval}
            <Card class="p-4 bg-info/5 border-info">
              <div class="flex items-center gap-2 text-info">
                <Icon name="clock" size={20} />
                <span class="font-medium">
                  This data updates every {liveData.data.updateInterval} minutes
                </span>
              </div>
            </Card>
          {/if}
        </div>
      {/if}

      <!-- Getting Started -->
      {#if !liveData && !isLoading}
        <Card class="p-8 text-center">
          <Icon name="activity" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 class="text-xl font-semibold mb-2">Real-Time Learning</h3>
          <p class="text-muted-foreground mb-6">
            Select a data type above to start exploring real-time information and educational insights
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div class="text-left">
              <h4 class="font-medium mb-2">📈 Market Data</h4>
              <p class="text-sm text-muted-foreground">Stock prices, crypto, and financial indicators</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">🌤️ Weather Data</h4>
              <p class="text-sm text-muted-foreground">Current conditions and climate patterns</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">🏆 Sports Data</h4>
              <p class="text-sm text-muted-foreground">Live scores and sports statistics</p>
            </div>
            <div class="text-left">
              <h4 class="font-medium mb-2">💰 Economic Data</h4>
              <p class="text-sm text-muted-foreground">Economic indicators and market trends</p>
            </div>
          </div>
        </Card>
      {/if}
    </div>
  </div>
</div> 