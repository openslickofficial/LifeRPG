import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-heading font-bold whitespace-nowrap select-none cursor-pointer outline-none transition-[transform,box-shadow,background-color] duration-75 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary Vivid Violet 3D Game Button
        default:
          "bg-violet-600 text-white shadow-[0_5px_0_0_#5b21b6] hover:bg-violet-500 hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_#5b21b6] dark:bg-violet-600 dark:shadow-[0_5px_0_0_#4c1d95] dark:hover:bg-violet-500 dark:active:shadow-[0_1px_0_0_#4c1d95]",

        // Duolingo-style Vivid Emerald "Complete Quest" / Success Button
        success:
          "bg-emerald-500 text-white shadow-[0_5px_0_0_#065f46] hover:bg-emerald-400 hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_#065f46] dark:bg-emerald-500 dark:shadow-[0_5px_0_0_#064e3b] dark:hover:bg-emerald-400 dark:active:shadow-[0_1px_0_0_#064e3b]",

        // Radiant Amber "Buy / Shop Gold" Button
        gold: "bg-amber-400 text-slate-950 shadow-[0_5px_0_0_#b45309] hover:bg-amber-300 hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_#b45309] dark:bg-amber-400 dark:shadow-[0_5px_0_0_#92400e] dark:hover:bg-amber-300 dark:active:shadow-[0_1px_0_0_#92400e]",

        // Saturated Crimson Destructive Button
        destructive:
          "bg-rose-600 text-white shadow-[0_5px_0_0_#9f1239] hover:bg-rose-500 hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_#9f1239] dark:bg-rose-600 dark:shadow-[0_5px_0_0_#881337] dark:hover:bg-rose-500 dark:active:shadow-[0_1px_0_0_#881337]",

        // Electric Cobalt Accent Button
        accent:
          "bg-blue-600 text-white shadow-[0_5px_0_0_#1e40af] hover:bg-blue-500 hover:brightness-105 active:translate-y-[4px] active:shadow-[0_1px_0_0_#1e40af] dark:bg-blue-600 dark:shadow-[0_5px_0_0_#1e3a8a] dark:hover:bg-blue-500 dark:active:shadow-[0_1px_0_0_#1e3a8a]",

        // Chunky 3D Bordered Arcade Button
        outline:
          "border-2 border-border/90 bg-card text-foreground shadow-[0_4px_0_0_hsl(var(--border))] hover:bg-secondary/70 active:translate-y-[3px] active:shadow-[0_1px_0_0_hsl(var(--border))]",

        // Muted Neutral Game Button
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_0_0_#cbd5e1] hover:bg-secondary/80 active:translate-y-[3px] active:shadow-[0_1px_0_0_#cbd5e1] dark:bg-secondary dark:shadow-[0_4px_0_0_#1e293b] dark:active:shadow-[0_1px_0_0_#1e293b]",

        // Ghost Button
        ghost: "text-foreground hover:bg-secondary/70 active:translate-y-[2px]",

        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        xs: "h-7 gap-1 rounded-xl px-2.5 text-xs shadow-[0_3px_0_0_currentColor] active:translate-y-[2px] active:shadow-[0_1px_0_0_currentColor]",
        sm: "h-9 gap-1.5 rounded-xl px-3.5 text-xs shadow-[0_3px_0_0_currentColor] active:translate-y-[2px] active:shadow-[0_1px_0_0_currentColor]",
        lg: "h-13 rounded-2xl px-7 text-base shadow-[0_6px_0_0_currentColor] active:translate-y-[4px] active:shadow-[0_1px_0_0_currentColor]",
        icon: "size-11 rounded-2xl",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-13 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
