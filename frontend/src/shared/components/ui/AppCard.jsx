'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { cn } from '@/shared/lib/utils';
export const AppCard = React.forwardRef(({ children, className, hoverEffect = true, animateIn = true, ...props }, ref) => {
    if (animateIn) {
        return (<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} whileHover={hoverEffect ? { transition: { duration: 0.2 } } : undefined}>
          <Card ref={ref} className={cn(hoverEffect && 'hover:shadow-lg hover:border-primary/30 transition-all duration-300', className)} {...props}>
            {children}
          </Card>
        </motion.div>);
    }
    return (<Card ref={ref} className={cn(hoverEffect && 'hover:shadow-lg hover:border-primary/30 transition-all duration-300', className)} {...props}>
        {children}
      </Card>);
});
AppCard.displayName = 'AppCard';
export default AppCard;
