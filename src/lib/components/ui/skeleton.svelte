<script lang="ts">
  import { cn } from "$lib/utils";
  
  interface Props {
    class?: string;
    width?: string;
    height?: string;
  }
  
  let { class: className = "", width = "100%", height = "20px" }: Props = $props();
</script>

<div 
  class={cn("animate-pulse bg-muted rounded", className)}
  style="width: {width}; height: {height};"
></div> 