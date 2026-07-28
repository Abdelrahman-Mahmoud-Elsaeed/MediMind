'use client';

import React from 'react';
import { Badge, badgeVariants, BadgeProps } from './Badge';
import { cn } from '@/shared/lib/utils';

export interface AppBadgeProps extends BadgeProps {
  icon?: React.ReactNode;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  children,
  className,
  icon,
  variant = 'default',
  ...props
}) => {
  return (
    <Badge variant={variant} className={cn('gap-1', className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </Badge>
  );
};

export default AppBadge;
