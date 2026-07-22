import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-panel p-5 transition-all duration-200 ease-out hover:border-border2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.34)]",
        className
      )}
      {...props}
    />
  );
}

export function CardFrame({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // Adds corner-bracket "instrument frame" accents, matching Cortex's visual language.
  return (
    <div className={cn("relative", className)} {...props}>
      <span className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l border-t border-border2" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b border-r border-border2" />
      {props.children}
    </div>
  );
}
