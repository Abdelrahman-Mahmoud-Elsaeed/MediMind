import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
const buttonVariants = cva('inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer select-none', {
    variants: {
        variant: {
            default: 'bg-primary text-on-primary hover:brightness-110 shadow-2xs',
            destructive: 'bg-error text-on-error hover:brightness-110 shadow-2xs',
            outline: 'border border-outline-variant/30 bg-surface-container-lowest text-on-surface hover:bg-surface-container hover:text-on-surface',
            secondary: 'bg-secondary-container text-on-secondary-container hover:brightness-105',
            ghost: 'hover:bg-surface-container hover:text-on-surface text-on-surface-variant',
            link: 'text-primary underline-offset-4 hover:underline',
            primaryContainer: 'bg-primary-container/20 text-primary hover:bg-primary-container/40 border border-primary/20',
            errorContainer: 'bg-error-container/30 text-error hover:bg-error-container/60 border border-error/20',
        },
        size: {
            default: 'h-10 px-5 py-2.5',
            sm: 'h-8 px-3.5 text-xs',
            lg: 'h-12 px-6 text-sm',
            icon: 'h-10 w-10 p-0 rounded-full',
            iconSm: 'h-8 w-8 p-0 rounded-lg',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
});
Button.displayName = 'Button';
export { Button, buttonVariants };
