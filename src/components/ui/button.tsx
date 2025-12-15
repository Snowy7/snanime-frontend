"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 border-none shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300",
        outline: "border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-md",
        ghost: "bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
        navbar: "bg-transparent text-white/70 hover:text-white hover:bg-white/10 rounded-full",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)] font-bold text-base px-8 h-12 rounded-full",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
  return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
      {...props}
      />
  );
  }
);
Button.displayName = "Button";

export const NavigationButton = ({
  direction,
  onClick,
  className = "",
}: {
  direction: "left" | "right";
  onClick: () => void;
  className?: string;
}) => {
  const isLeft = direction === "left";
  const Icon = isLeft ? ChevronLeft : ChevronRight;

  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? "Previous" : "Next"}
      className={cn(
        "group inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl transition-all hover:scale-110 hover:bg-white/10 hover:border-white/20 active:scale-95",
        className
      )}
    >
      <Icon 
        className={cn(
          "h-6 w-6 text-white transition-transform duration-300",
          isLeft ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
        )}
      />
    </button>
  );
};

export const ControlButton = ({
  type,
  children,
  className = "",
  variant = "default",
  iconOnly = false,
  onClick,
}: {
  type: "primary" | "save" | "share" | "premium" | "navbar-action";
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "navbar";
  iconOnly?: boolean;
  iconColorClass?: string;
  onClick?: () => void;
}) => {
  const mappedVariant: VariantProps<typeof buttonVariants>["variant"] =
    variant === "navbar"
      ? "navbar"
      : type === "primary"
        ? "primary"
        : "default";

  return (
    <Button
      variant={mappedVariant}
      size={iconOnly ? "icon" : type === "primary" ? "lg" : "md"}
      onClick={onClick}
      className={cn(
        type === "premium" && "border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500",
        type === "save" && "bg-black/40 border border-white/10 hover:bg-white/10 backdrop-blur-md", // Matches "Add to list" style
        type === "share" && "bg-black/40 border border-white/10 hover:bg-white/10 backdrop-blur-md",
        type === "navbar-action" && "text-neutral-400 hover:text-white",
        className
      )}
    >
        {children}
    </Button>
  );
};

export const IconButton = ({
  type,
  icon,
  className = "",
  onClick,
}: {
  type: "save" | "share";
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <Button
      size="icon"
      variant="default"
      onClick={onClick}
      className={cn(
        "bg-white/5 border-white/10 hover:bg-white/15 backdrop-blur-md",
        className
      )}
    >
      <span className="text-white">{icon}</span>
    </Button>
  );
};
