import * as React from 'react';
import { cn } from '@/shared/lib/utils';
const ProgressBar = React.forwardRef(({ className, value = 0, indicatorClassName, ...props }, ref) => (<div ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800', className)} {...props}>
      <div className={cn('h-full w-full flex-1 bg-primary transition-all duration-500 rounded-full', indicatorClassName)} style={{ transform: `translateX(-${100 - (value || 0)}%)` }}/>
    </div>));
ProgressBar.displayName = 'ProgressBar';
export { ProgressBar };
