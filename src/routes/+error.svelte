<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let error = $derived($page.error);
  let status = $derived($page.status || 500);
</script>

<svelte:head>
  <title>Error {status} - CogniZap</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-error/10 via-base-100 to-warning/10 flex items-center justify-center">
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto text-center">
      <div class="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl border border-base-300/50">
        <div class="card-body p-16">
          <div class="text-8xl mb-8">
            {#if status === 404}
              🔍
            {:else if status === 500}
              💥
            {:else}
              ⚠️
            {/if}
          </div>
          
          <h1 class="text-5xl font-bold mb-4 text-error">Error {status}</h1>
          
          <div class="text-2xl font-semibold mb-6 text-base-content">
            {#if status === 404}
              Page Not Found
            {:else if status === 500}
              Internal Server Error
            {:else}
              Something went wrong
            {/if}
          </div>
          
          <p class="text-lg text-base-content/70 mb-8 leading-relaxed">
            {#if status === 404}
              The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            {:else if status === 500}
              We're experiencing some technical difficulties. Our team has been notified and we're working to fix this.
            {:else}
              {error?.message || 'An unexpected error occurred. Please try again later.'}
            {/if}
          </p>
          
          <div class="flex flex-wrap gap-4 justify-center">
            <button 
              class="btn btn-primary btn-lg gap-2 px-8 hover:scale-105 shadow-lg transition-all duration-300"
              onclick={() => goto('/')}
            >
              <span class="text-xl">🏠</span>
              Go Home
            </button>
            
            <button 
              class="btn btn-outline btn-lg gap-2 px-6 hover:btn-secondary transition-all duration-300"
              onclick={() => window.history.back()}
            >
              <span class="text-xl">⬅️</span>
              Go Back
            </button>
          </div>
          
          <div class="mt-8">
            <div class="text-sm text-base-content/50">
              Need help? Try refreshing the page or contact support.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 