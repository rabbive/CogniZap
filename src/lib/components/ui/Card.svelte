<script lang="ts">
  import { cn } from '$lib/utils.js';
  
  interface Props {
    variant?: 'normal' | 'compact' | 'side';
    bordered?: boolean;
    imageFull?: boolean;
    glass?: boolean;
    class?: string;
    children?: any;
  }

  let {
    variant = 'normal',
    bordered = false,
    imageFull = false,
    glass = false,
    class: className = '',
    children
  }: Props = $props();

  let cardClass = $derived(cn(
    'card bg-base-100 shadow-xl',
    {
      [`card-${variant}`]: variant !== 'normal',
      'card-bordered': bordered,
      'image-full': imageFull,
      'glass': glass,
    },
    className
  ));
</script>

<div class={cardClass}>
  {@render children()}
</div> 