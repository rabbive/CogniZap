<script lang="ts">
  import { cn } from '$lib/utils.js';
  
  interface Props {
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'success' | 'warning' | 'error';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    shape?: 'square' | 'circle' | 'wide' | 'block';
    loading?: boolean;
    disabled?: boolean;
    onclick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    children?: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    shape,
    loading = false,
    disabled = false,
    onclick,
    type = 'button',
    class: className = '',
    children
  }: Props = $props();

  let buttonClass = $derived(cn(
    'btn',
    {
      [`btn-${variant}`]: variant,
      [`btn-${size}`]: size,
      [`btn-${shape}`]: shape,
      'loading': loading,
    },
    className
  ));
</script>

<button 
  class={buttonClass}
  {type}
  {disabled}
  {onclick}
  aria-label={loading ? 'Loading...' : undefined}
>
  {#if loading}
    <span class="loading loading-spinner loading-sm"></span>
  {/if}
  {@render children()}
</button> 