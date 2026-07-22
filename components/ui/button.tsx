"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[11px] text-sm font-semibold transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none active:scale-95",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-amber to-[#e8632a] text-[#160c05] font-display tracking-wide hover:brightness-110 hover:shadow-[0_6px_20px_rgba(255,122,60,0.35)] hover:-translate-y-px",
        ghost: "bg-panel2 border border-border2 text-muted hover:text-ice hover:border-ice",
        outline: "border border-border2 bg-transparent text-ink hover:border-amber hover:text-amber",
        subtle: "bg-panel2 border border-border2 text-ink hover:bg-panel3",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-8 px-3 text-xs",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
