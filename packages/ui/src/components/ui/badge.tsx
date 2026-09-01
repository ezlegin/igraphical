import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@igraph/ui/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full justify-center border px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-primary/15 dark:text-primary",
        green:
          "border-[1px] border-green-600 bg-green-100 text-green-800 dark:text-green-300 dark:bg-green-500/15",
        red: "border-[1px] border-red-600 bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
        blue: "border-[1px] border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-400",
        gray: "border-[1px] border-slate-400 bg-slate-50 text-gray-800 hover:bg-gray-200 dark:bg-muted dark:text-foreground dark:border-border",
        orange:
          "border-[1px] border-orange-400 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:bg-orange-500/15 dark:text-orange-400",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground  hover:bg-destructive/80",
        outline: "text-foreground",
        primary:
          "border-transparent bg-primary/10 text-secondary-foreground hover:bg-primary/100 hover:text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
