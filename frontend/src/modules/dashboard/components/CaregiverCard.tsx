'use client';

import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';

interface Caregiver {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online?: boolean;
}

export const CaregiverCard: React.FC = () => {
  const { locale } = useTranslation();

  const caregivers: Caregiver[] = [
    {
      id: 'c1',
      name: locale === 'ar' ? 'د. دانيال أحمد' : 'Dr. James Wilson',
      role: locale === 'ar' ? 'الطبيب المعالج' : 'Primary Physician',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      online: true,
    },
    {
      id: 'c2',
      name: locale === 'ar' ? 'مريم محمود' : 'Martha Sarah',
      role: locale === 'ar' ? 'فرد من العائلة' : 'Family Member',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      online: true,
    },
  ];

  const handleCall = (name: string) => {
    alert(locale === 'ar' ? `الاتصال بـ ${name}...` : `Calling ${name}...`);
  };

  const handleMessage = (name: string) => {
    alert(locale === 'ar' ? `فتح المحادثة مع ${name}...` : `Opening chat with ${name}...`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {locale === 'ar' ? 'دائرة الرعاية والمتابعة' : 'Caregivers Circle'}
        </h3>
      </div>

      <div className="space-y-4">
        {caregivers.map((person) => (
          <motion.div
            key={person.id}
            whileHover={{ x: 2 }}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            {/* Person Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-xs"
                />
                {person.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                  {person.name}
                </h4>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {person.role}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCall(person.name)}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer shadow-2xs"
                title={locale === 'ar' ? `اتصال بـ ${person.name}` : `Call ${person.name}`}
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMessage(person.name)}
                className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer shadow-2xs"
                title={locale === 'ar' ? `مراسلة ${person.name}` : `Chat with ${person.name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
