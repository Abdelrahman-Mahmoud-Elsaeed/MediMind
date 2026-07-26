import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  color?: string; // e.g. '#16B364'
  height?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = '#16B364',
  height = 'h-2',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height} ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};
