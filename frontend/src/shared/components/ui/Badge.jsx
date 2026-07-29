import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2', {
    variants: {
        variant: {
            default: 'bg-primary-container/30 text-primary border border-primary/30',
            secondary: 'bg-secondary-container text-on-secondary-container border border-outline-variant/30',
            destructive: 'bg-error-container/40 text-error border border-error/30',
            outline: 'text-on-surface border border-outline-variant/40 bg-surface-container/20',
            success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
            warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
            info: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});
function Badge({ className, variant, ...props }) {
    return (<div className={cn(badgeVariants({ variant }), className)} {...props}/>);
}
export { Badge, badgeVariants };
