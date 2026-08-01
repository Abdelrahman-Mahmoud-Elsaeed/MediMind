'use client';
import { AppCard } from '@/shared/components/ui/AppCard';
import { AppButton } from '@/shared/components/ui/AppButton';
import { Phone, MessageSquare, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/shared/lib/i18nContext';
import { usePatientRelationshipsQuery } from '@/modules/patient/hooks/usePatientQueries';

export const CaregiverCard = () => {
    const { locale } = useTranslation();
    const isAr = locale === 'ar';
    const { data: relationships = [], isLoading } = usePatientRelationshipsQuery();

    const caregivers = relationships.map((rel) => {
      const cg = rel.caregiverId || {};
      const name = cg.firstName && cg.lastName ? `${cg.firstName} ${cg.lastName}` : (rel.relation || 'Caregiver');
      return {
        id: rel._id || rel.relationshipId,
        name,
        role: rel.relation || (isAr ? 'مقدم رعاية' : 'Caregiver'),
        avatar: cg.profilePictureUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        online: rel.status === 'ACCEPTED',
        phone: cg.phone || '+15550123456',
      };
    });

    const handleCall = (name, phone) => {
        alert(isAr ? `جاري الاتصال بـ ${name} (${phone})...` : `Calling ${name} (${phone})...`);
    };
    const handleMessage = (name) => {
        alert(isAr ? `إرسال رسالة إلى ${name}...` : `Messaging ${name}...`);
    };

    return (<AppCard className="hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-[11px] font-extrabold text-on-surface-variant uppercase tracking-widest opacity-80">
          {isAr ? 'دائرة الرعاية والمتابعة' : 'Caregivers Circle'}
        </h3>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-on-surface-variant animate-pulse">
          {isAr ? 'جاري تحميل قائمة مقدمي الرعاية...' : 'Loading caregivers circle...'}
        </div>
      ) : caregivers.length === 0 ? (
        <div className="py-6 text-center text-xs text-on-surface-variant">
          {isAr ? 'لا يوجد مقدمو رعاية مرتبكون حالياً' : 'No connected caregivers yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {caregivers.map((person) => (
            <motion.div key={person.id} whileHover={{ x: 2 }} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container/40 border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
              {/* Person Info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={person.avatar} alt={person.name} className="w-11 h-11 rounded-full object-cover border-2 border-background shadow-2xs"/>
                  {person.online && (<span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full"/>)}
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
                <AppButton type="button" variant="outline" size="iconSm" onClick={() => handleCall(person.name, person.phone)} title={isAr ? `اتصال بـ ${person.name}` : `Call ${person.name}`}>
                  <Phone className="w-3.5 h-3.5 text-primary"/>
                </AppButton>
                <AppButton type="button" variant="outline" size="iconSm" onClick={() => handleMessage(person.name)} title={isAr ? `مراسلة ${person.name}` : `Chat with ${person.name}`}>
                  <MessageSquare className="w-3.5 h-3.5 text-primary"/>
                </AppButton>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppCard>);
};
