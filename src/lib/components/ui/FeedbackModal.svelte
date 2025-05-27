<script lang="ts">
  import { cn } from "$lib/utils";
  import Button from "./Button.svelte";
  import Icon from "./Icons.svelte";
  
  interface Props {
    isOpen?: boolean;
    onClose?: () => void;
  }
  
  let { isOpen = $bindable(false), onClose }: Props = $props();
  
  let feedbackType = $state('suggestion');
  let feedbackText = $state('');
  let userEmail = $state('');
  let isSubmitting = $state(false);
  let isSuccess = $state(false);
  
  async function submitFeedback() {
    if (!feedbackText.trim()) return;
    
    isSubmitting = true;
    
    try {
      // Store feedback in localStorage for now (later can be sent to backend)
      const feedback = {
        type: feedbackType,
        text: feedbackText,
        email: userEmail,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        page: window.location.pathname
      };
      
      const existingFeedback = JSON.parse(localStorage.getItem('cogniZapFeedback') || '[]');
      existingFeedback.push(feedback);
      localStorage.setItem('cogniZapFeedback', JSON.stringify(existingFeedback));
      
      isSuccess = true;
      setTimeout(() => {
        isOpen = false;
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  function resetForm() {
    feedbackType = 'suggestion';
    feedbackText = '';
    userEmail = '';
    isSuccess = false;
  }
  
  function handleClose() {
    onClose?.();
    resetForm();
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
    onclick={handleClose}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="feedback-title"
  >
    <!-- Modal -->
    <div 
      class="bg-background rounded-lg shadow-xl max-w-md w-full p-6" 
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      {#if isSuccess}
        <div class="text-center space-y-4">
          <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="check" size={32} className="text-green-600" />
          </div>
          <h3 class="text-lg font-semibold">Thank you!</h3>
          <p class="text-muted-foreground">Your feedback has been submitted successfully.</p>
        </div>
      {:else}
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 id="feedback-title" class="text-lg font-semibold">Send Feedback</h3>
            <Button variant="ghost" size="icon" onclick={handleClose}>
              <Icon name="x" size={20} />
            </Button>
          </div>
          
          <div class="space-y-2">
            <label for="feedback-type" class="text-sm font-medium">Feedback Type</label>
            <select id="feedback-type" bind:value={feedbackType} class="w-full p-2 border rounded-md bg-background">
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="general">General Feedback</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label for="feedback-text" class="text-sm font-medium">Your Feedback</label>
            <textarea 
              id="feedback-text"
              bind:value={feedbackText}
              placeholder="Tell us what you think..."
              rows={4}
              class="w-full p-3 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>
          
          <div class="space-y-2">
            <label for="feedback-email" class="text-sm font-medium">Email (Optional)</label>
            <input 
              id="feedback-email"
              type="email"
              bind:value={userEmail}
              placeholder="your@email.com"
              class="w-full p-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div class="flex gap-2 pt-2">
            <Button variant="outline" onclick={handleClose} class="flex-1">
              Cancel
            </Button>
            <Button 
              onclick={submitFeedback} 
              disabled={!feedbackText.trim() || isSubmitting}
              class="flex-1"
            >
              {#if isSubmitting}
                <Icon name="loader" size={16} className="mr-2 animate-spin" />
                Sending...
              {:else}
                Send Feedback
              {/if}
            </Button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if} 