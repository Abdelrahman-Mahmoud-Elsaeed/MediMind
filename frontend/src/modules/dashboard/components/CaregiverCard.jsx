'use client';
import { AppCard } from '@/shared/components/ui/AppCard';
import { AppButton } from '@/shared/components/ui/AppButton';
import { Phone, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';
export const CaregiverCard = () => {
    const { locale } = useTranslation();
    const caregivers = [
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
    const handleCall = (name) => {
        alert(locale === 'ar' ? `الاتصال بـ ${name}...` : `Calling ${name}...`);
    };
    const handleMessage = (name) => {
        alert(locale === 'ar' ? `فتح المحادثة مع ${name}...` : `Opening chat with ${name}...`);
    };
    return (<AppCard className="hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest opacity-80">
          {locale === 'ar' ? 'دائرة الرعاية والمتابعة' : 'Caregivers Circle'}
        </h3>
      </div>

      <div className="space-y-4">
        {caregivers.map((person) => (<motion.div key={person.id} whileHover={{ x: 2 }} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container/40 border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
            {/* Person Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={person.avatar} alt={person.name} className="w-11 h-11 rounded-full object-cover border-2 border-background shadow-2xs"/>
                {person.online && (<span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-background rounded-full"/>)}
              </div>
              <div>
                <h4 className="font-extrabold text-on-surface text-sm leading-tight">
                  {person.name}
                </h4>
                <p className="text-xs font-medium text-on-surface-variant">
                  {person.role}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <AppButton type="button" variant="outline" size="iconSm" onClick={() => handleCall(person.name)} title={locale === 'ar' ? `اتصال بـ ${person.name}` : `Call ${person.name}`}>
                <Phone className="w-3.5 h-3.5 text-primary"/>
              </AppButton>
              <AppButton type="button" variant="outline" size="iconSm" onClick={() => handleMessage(person.name)} title={locale === 'ar' ? `مراسلة ${person.name}` : `Chat with ${person.name}`}>
                <MessageSquare className="w-3.5 h-3.5 text-primary"/>
              </AppButton>
            </div>
          </motion.div>))}
      </div>
    </AppCard>);
};
