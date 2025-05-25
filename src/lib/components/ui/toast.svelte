<script lang="ts">
  import { cn } from "$lib/utils";
  import { type VariantProps, tv } from "tailwind-variants";
  import { onMount } from "svelte";
  import { CheckCircle, AlertCircle, Info, X } from "lucide-svelte";

  const toastVariants = tv({
    base: "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "border-success bg-success text-success-foreground",
        warning: "border-warning bg-warning text-warning-foreground",
        info: "border-info bg-info text-info-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  });

  type Variant = VariantProps<typeof toastVariants>["variant"];

  interface $$Props {
    variant?: Variant;
    title?: string;
    description?: string;
    duration?: number;
    onClose?: () => void;
    class?: string;
  }

  let {
    variant = "default",
    title,
    description,
    duration = 5000,
    onClose,
    class: className
  }: $$Props = $props();

  let visible = $state(true);

  const icons = {
    default: Info,
    destructive: AlertCircle,
    success: CheckCircle,
    warning: AlertCircle,
    info: Info
  };

  const IconComponent = icons[variant || 'default'];

  onMount(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  });

  function handleClose() {
    visible = false;
    onClose?.();
  }
</script>

{#if visible}
  <div class={cn(toastVariants({ variant }), className)}>
    <div class="flex items-start gap-3">
      <IconComponent class="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div class="flex-1 space-y-1">
        {#if title}
          <div class="text-sm font-semibold">{title}</div>
        {/if}
        {#if description}
          <div class="text-sm opacity-90">{description}</div>
        {/if}
      </div>
    </div>
    <button
      class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      onclick={handleClose}
    >
      <X class="h-4 w-4" />
    </button>
  </div>
{/if} 