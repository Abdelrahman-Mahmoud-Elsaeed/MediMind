import * as React from 'react';
import { cn } from '@/shared/lib/utils';
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (<input type={type} className={cn('flex h-11 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest dark:bg-surface-container-low px-3.5 py-2 text-sm text-on-surface ring-offset-background placeholder:text-on-surface-variant/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors', type === 'date' &&
            'relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none', className)} ref={ref} {...props}/>);
});
Input.displayName = 'Input';
export { Input };
