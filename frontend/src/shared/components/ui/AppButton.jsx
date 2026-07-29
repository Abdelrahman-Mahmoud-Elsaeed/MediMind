'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/shared/lib/utils';
export const AppButton = React.forwardRef(({ children, className, isLoading = false, leftIcon, rightIcon, disabled, variant = 'default', size = 'default', ...props }, ref) => {
    return (<Button ref={ref} variant={variant} size={size} disabled={disabled || isLoading} className={cn('gap-2', className)} {...props}>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0"/>}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </Button>);
});
AppButton.displayName = 'AppButton';
export default AppButton;
