<script lang="ts">
  import { cn } from "$lib/utils";
  import Icon from "./Icons.svelte";

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
    value?: string;
    class?: string;
    onCheckedChange?: (checked: boolean) => void;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    id,
    name,
    value,
    class: className = "",
    onCheckedChange
  }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    checked = target.checked;
    onCheckedChange?.(checked);
  }
</script>

<div class="relative flex items-center">
  <input
    type="checkbox"
    {id}
    {name}
    {value}
    {disabled}
    bind:checked
    onchange={handleChange}
    class={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      "sr-only", // Hide the default checkbox
      className
    )}
  />
  <div
    class={cn(
      "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
      "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      "peer-checked:bg-primary peer-checked:text-primary-foreground",
      "flex items-center justify-center transition-colors",
      disabled && "cursor-not-allowed opacity-50"
    )}
  >
    {#if checked}
      <Icon name="check" size={12} className="text-current" />
    {/if}
  </div>
</div> 