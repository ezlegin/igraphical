import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@igraph/ui/lib/utils";

const buttonVariants = cva(
  "inline-flex rounded-full hover:-translate-y-px transition-all duration-300 select-none items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary dark:bg-gradient-to-br dark:border dark:border-white/15 from-primary to-primary/70 text-primary-foreground shadow hover:bg-primary/90 active:translate-y-0 active:shadow-sm",
        dark: "bg-slate-800 text-primary-foreground shadow hover:bg-slate-900",
        gold: "bg-slate-800 text-primary-foreground shadow hover:bg-slate-900 bg-gold",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        lightRed:
          "bg-destructive/50 text-destructive-foreground shadow-sm hover:bg-destructive/90",
        lightGreen:
          "bg-green-200 border-t border-green-500/30 text-green-800 shadow-sm hover:bg-green-300",
        lightPrimary:
          "bg-primary/15 border-t border-primary/30 text-primary shadow-sm hover:bg-primary/30",
        outline:
          "border bg-background shadow-xs dark:hover:shadow-lg dark:hover:shadow-primary-20 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary bg-gradient-to-b from-secondary to-secondary/70 border-t border-white/15 text-secondary-foreground shadow-sm hover:bg-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
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

export { Button, buttonVariants };
