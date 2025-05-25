<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    error?: string;
    label?: string;
    description?: string;
    id?: string;
    type?: string;
    value?: string;
    class?: string;
    onkeydown?: ((event: KeyboardEvent) => void) | undefined;
  }

  let {
    error = "",
    label = "",
    description = "",
    id = "",
    type = "text",
    value = $bindable(""),
    class: className = "",
    onkeydown,
    ...restProps
  }: Props = $props();

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="space-y-2">
  {#if label}
    <label for={inputId} class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {label}
    </label>
  {/if}
  
  <input
    id={inputId}
    {type}
    bind:value
    class={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      error && "border-destructive focus-visible:ring-destructive",
      className
    )}
    {onkeydown}
    {...restProps}
  />
  
  {#if description}
    <p class="text-sm text-muted-foreground">
      {description}
    </p>
  {/if}
  
  {#if error}
    <p class="text-sm text-destructive">
      {error}
    </p>
  {/if}
</div> 