<script lang="ts">
  import { cn } from "$lib/utils";
  import { type VariantProps, tv } from "tailwind-variants";
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  const badgeVariants = tv({
    base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/80"
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  });

  type Variant = VariantProps<typeof badgeVariants>["variant"];
  type Size = VariantProps<typeof badgeVariants>["size"];

  interface Props extends HTMLAttributes<HTMLDivElement> {
    variant?: Variant;
    size?: Size;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = "default",
    size = "default",
    class: className = "",
    children,
    ...restProps
  }: Props = $props();
</script>

<div
  class={cn(badgeVariants({ variant, size }), className)}
  {...restProps}
>
  {@render children?.()}
</div> 