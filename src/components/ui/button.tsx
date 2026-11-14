import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
};

export function Button({ className, variant = "primary", size = "default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm",
        variant === "primary" && "bg-blue-500 text-white shadow-lg shadow-blue-950/30 hover:bg-blue-400",
        variant === "secondary" && "border border-white/10 bg-white/[0.06] text-zinc-200 hover:bg-white/10",
        variant === "ghost" && "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
        className
      )}
      {...props}
    />
  );
}
