import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-xl border px-3 py-1 text-xs font-heading font-black tracking-wider uppercase whitespace-nowrap transition-colors select-none [&>svg]:pointer-events-none [&>svg]:size-3.5 shadow-xs",
  {
    variants: {
      variant: {
        default:
          "border-violet-700 bg-violet-600 text-white shadow-[0_2px_0_0_#4c1d95]",
        secondary:
          "border-slate-300 dark:border-slate-700 bg-secondary text-secondary-foreground shadow-[0_2px_0_0_rgba(0,0,0,0.1)]",
        destructive:
          "border-rose-700 bg-rose-600 text-white shadow-[0_2px_0_0_#9f1239]",
        outline:
          "border-2 border-border text-foreground bg-card shadow-[0_2px_0_0_rgba(0,0,0,0.06)]",
        xp: "border-emerald-700 bg-emerald-500 text-white font-mono shadow-[0_2px_0_0_#065f46]",
        mana: "border-blue-700 bg-blue-600 text-white font-mono shadow-[0_2px_0_0_#1e40af]",
        gold: "border-amber-600 bg-amber-400 text-slate-950 font-mono shadow-[0_2px_0_0_#b45309]",
        brand:
          "border-violet-700 bg-violet-600 text-white shadow-[0_2px_0_0_#4c1d95]",
        streak:
          "border-rose-700 bg-rose-600 text-white font-mono shadow-[0_2px_0_0_#9f1239]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
