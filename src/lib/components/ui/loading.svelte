<script lang="ts">
  import { cn } from "$lib/utils";
  import { type VariantProps, tv } from "tailwind-variants";

  const loadingVariants = tv({
    base: "animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12"
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
        white: "text-white"
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default"
    }
  });

  type Size = VariantProps<typeof loadingVariants>["size"];
  type Variant = VariantProps<typeof loadingVariants>["variant"];

  interface $$Props {
    size?: Size;
    variant?: Variant;
    class?: string;
    text?: string;
  }

  let {
    size = "default",
    variant = "default",
    class: className,
    text
  }: $$Props = $props();
</script>

<div class={cn("flex items-center gap-2", className)}>
  <div class={loadingVariants({ size, variant })} role="status" aria-label="Loading">
    <span class="sr-only">Loading...</span>
  </div>
  {#if text}
    <span class="text-sm text-muted-foreground">{text}</span>
  {/if}
</div> 