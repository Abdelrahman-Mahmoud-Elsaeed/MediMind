'use client';

import React from 'react';
import { AppCard } from '@/shared/components/ui/AppCard';
import { Flame, Lightbulb, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';

export const QuickActions: React.FC = () => {
  const { locale } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {/* Card 1: Streak */}
      <motion.div whileHover={{ y: -2 }}>
        <AppCard className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                {locale === 'ar' ? 'سلسلة الالتزام بالدواء' : 'Medication Streak'}
              </h4>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {locale === 'ar' ? '🔥 سلسلة مثالية لمدة ١٤ يوماً!' : '🔥 14-Day Perfect Streak!'}
              </p>
            </div>
          </div>
        </AppCard>
      </motion.div>

      {/* Card 2: Health Tip */}
      <motion.div whileHover={{ y: -2 }}>
        <AppCard className="bg-gradient-to-br from-primary-container/20 via-primary-container/5 to-transparent border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                {locale === 'ar' ? 'نصيحة صحية' : 'Health Tip'}
              </h4>
              <p className="text-xs font-medium text-on-surface-variant mt-0.5">
                {locale === 'ar'
                  ? 'تناول الدواء مع كمية كافية من الماء بعد الغداء مباشرة لامتصاص مثالي.'
                  : 'Take Atorvastatin with water right after lunch for optimal absorption.'}
              </p>
            </div>
          </div>
        </AppCard>
      </motion.div>

      {/* Card 3: Refill Reminder */}
      <motion.div whileHover={{ y: -2 }}>
        <AppCard className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-200/60 dark:border-rose-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                {locale === 'ar' ? 'إعادة تعبئة وشيكة' : 'Upcoming Refill'}
              </h4>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                {locale === 'ar'
                  ? 'متبقي ١٢ قرصاً في العبوة الحالية (تكفي لمطبقي ٣ أيام).'
                  : 'Atorvastatin 10mg has 12 pills remaining (3 days left).'}
              </p>
            </div>
          </div>
        </AppCard>
      </motion.div>
    </div>
  );
};
