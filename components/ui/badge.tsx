import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  color,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { color?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-medium tracking-wide",
        className
      )}
      style={color ? { borderColor: color, color } : undefined}
      {...props}
    />
  );
}
