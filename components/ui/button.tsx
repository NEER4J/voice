import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground border border-white/20 bg-white/5",
        link: "text-primary underline-offset-4 hover:underline",
        magic: "relative overflow-hidden transition-all duration-300 ease-in-out bg-gradient-to-b from-[#7a5af8] to-[#7a5af8] hover:scale-105 active:scale-95 rounded-xl border-none outline-none px-6 py-3 text-white font-medium shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-full px-3 text-xs",
        lg: "h-10 rounded-full px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// Magic Button Component with animated effects
interface MagicButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const MagicButton = React.forwardRef<HTMLButtonElement, MagicButtonProps>(
  ({ className, children, icon, size = 'md', disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-10 py-5 text-xl"
    };
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden transition-all duration-300 ease-in-out",
          "rounded-full border-none outline-none font-medium",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          disabled 
            ? "bg-gray-400 text-gray-200 shadow-none" 
            : "bg-gradient-to-br from-[#3b82f6] via-[#1d4ed8] to-[#1e40af] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:shadow-[0_0_50px_rgba(59,130,246,0.8)]",
          !disabled && "before:absolute before:inset-[1px] before:rounded-full before:z-0 before:bg-gradient-to-b before:from-white/19 before:to-transparent before:transition-all before:duration-500 before:ease-in-out",
          !disabled && "after:absolute after:inset-[2px] after:rounded-full after:z-0 after:bg-gradient-to-br after:from-[#3b82f6] after:via-[#1d4ed8] after:to-[#1e40af] after:transition-all after:duration-500 after:ease-in-out",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Floating points - only show when not disabled */}
        {!disabled && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full animate-[floating-points_infinite_ease-in-out]",
                  i === 0 && "left-[10%] opacity-100 animate-[2.35s_0.2s_floating-points_infinite_ease-in-out]",
                  i === 1 && "left-[30%] opacity-70 animate-[2.5s_0.5s_floating-points_infinite_ease-in-out]",
                  i === 2 && "left-[25%] opacity-80 animate-[2.2s_0.1s_floating-points_infinite_ease-in-out]",
                  i === 3 && "left-[44%] opacity-60 animate-[2.05s_0s_floating-points_infinite_ease-in-out]",
                  i === 4 && "left-[50%] opacity-100 animate-[1.9s_0s_floating-points_infinite_ease-in-out]",
                  i === 5 && "left-[75%] opacity-50 animate-[1.5s_1.5s_floating-points_infinite_ease-in-out]",
                  i === 6 && "left-[88%] opacity-90 animate-[2.2s_0.2s_floating-points_infinite_ease-in-out]",
                  i === 7 && "left-[58%] opacity-80 animate-[2.25s_0.2s_floating-points_infinite_ease-in-out]",
                  i === 8 && "left-[98%] opacity-60 animate-[2.6s_0.1s_floating-points_infinite_ease-in-out]",
                  i === 9 && "left-[65%] opacity-100 animate-[2.5s_0.2s_floating-points_infinite_ease-in-out]"
                )}
              />
            ))}
          </div>
        )}
        
        {/* Content */}
        <span className={cn(
          "relative z-20 flex items-center justify-center gap-1.5 font-medium leading-6 transition-colors duration-200",
          disabled ? "text-gray-200" : "text-white"
        )}>
          {icon && (
            <svg
              className={cn(
                "transition-all duration-100 ease-linear",
                size === 'sm' && "w-4 h-4",
                size === 'md' && "w-[18px] h-[18px]",
                size === 'lg' && "w-5 h-5",
                size === 'xl' && "w-6 h-6"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
              <line x1="8" x2="16" y1="22" y2="22" />
            </svg>
          )}
          {children}
        </span>
      </button>
    );
  }
);

MagicButton.displayName = "MagicButton";

export { Button, buttonVariants, MagicButton };
