import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden active:scale-95 transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90 active:bg-slate-900/95 shadow-sm hover:shadow-md active:shadow-sm",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 active:bg-red-500/95 shadow-sm hover:shadow-md active:shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 shadow-sm hover:shadow-md active:shadow-sm",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 active:bg-slate-200 shadow-sm hover:shadow-md active:shadow-sm",
        ghost: "hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
        link: "text-slate-900 underline-offset-4 hover:underline active:text-slate-700",
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md active:shadow-sm",
        success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md active:shadow-sm",
        warning: "bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 shadow-sm hover:shadow-md active:shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  asChild = false, 
  children,
  onClick,
  disabled,
  loading = false,
  ripple = true,
  ...props 
}, ref) => {
  const [isClicked, setIsClicked] = React.useState(false);
  const [ripples, setRipples] = React.useState([]);
  const buttonRef = React.useRef(null);

  // Combine refs
  const combinedRef = React.useCallback((node) => {
    buttonRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  // Handle click with ripple effect
  const handleClick = React.useCallback((e) => {
    if (disabled || loading) return;

    // Add click animation
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);

    // Create ripple effect
    if (ripple && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const newRipple = {
        x,
        y,
        size,
        id: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 600);
    }

    // Call original onClick
    if (onClick) {
      onClick(e);
    }
  }, [disabled, loading, ripple, onClick]);

  const Comp = asChild ? Slot : "button";
  
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, size }),
        isClicked && "scale-95",
        loading && "cursor-wait",
        className
      )}
      ref={combinedRef}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple Effects */}
      {ripple && (
        <span className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full animate-ping"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                animationDuration: '600ms',
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          ))}
        </span>
      )}
      
      {/* Loading Spinner */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      
      {/* Content */}
      <span className={cn("relative flex items-center justify-center gap-2", loading && "invisible")}>
        {children}
      </span>
    </Comp>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
