'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Pill, AlertCircle, Calendar } from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppBadge } from '@/shared/components/ui';
import CaregiverPatientHeader from './CaregiverPatientHeader';
import CaregiverPatientAdherenceSummary from './CaregiverPatientAdherenceSummary';
import { 
  useCaregiverRelationshipsQuery,
  usePatientMedicationsQuery 
} from '../hooks/useCaregiverQueries';

export function CaregiverPatientDetailComponent() {
  const { id: patientId } = useParams();
  const { t } = useTranslation();

  const { data: relationships = [], isLoading: isRelLoading } = useCaregiverRelationshipsQuery();
  const { data: medications = [], isLoading: isMedsLoading } = usePatientMedicationsQuery(patientId);

  const relationship = relationships.find(r => 
    String(r.id) === String(patientId) ||
    String(r._id) === String(patientId) ||
    String(r.relationshipId) === String(patientId) ||
    String(r.patientId?.id) === String(patientId) ||
    String(r.patientId?._id) === String(patientId) ||
    String(r.patientId) === String(patientId) ||
    String(r.patient?.id) === String(patientId) ||
    String(r.patient?._id) === String(patientId)
  );
  const patient = relationship?.patientId || relationship?.patient || { id: patientId };

  const isLoading = isRelLoading || isMedsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-40 bg-surface-container-low rounded-3xl" />
        <div className="h-64 bg-surface-container-low rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Composable Patient Header */}
      <CaregiverPatientHeader patient={patient} relationship={relationship} />

      {/* Grid of Adherence & Cabinet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Adherence Summary */}
        <div className="lg:col-span-1 space-y-6">
          <CaregiverPatientAdherenceSummary adherenceData={{ adherenceRate: 85, takenCount: 12, missedCount: 2 }} />
        </div>

        {/* Right Column: Active Medications List */}
        <div className="lg:col-span-2 space-y-6">
          <AppCard className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-on-surface">
                  {t('caregiver.patientHub.activeMeds')}
                </h2>
              </div>
              <AppBadge variant="secondary">
                {medications.length} {t('common.nav.meds')}
              </AppBadge>
            </div>

            {medications.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">
                {t('caregiver.patientHub.noActiveMeds')}
              </p>
            ) : (
              <div className="space-y-4">
                {medications.map((med, index) => {
                  const dosageText = typeof med.dosage === 'object' ? `${med.dosage?.amount || ''} ${med.dosage?.unit || ''}`.trim() : (med.dosage || '');
                  const instructionsText = typeof med.instructions === 'object'
                    ? ([med.instructions?.relationToMeals?.replace(/_/g, ' '), med.instructions?.notes, med.instructions?.specialInstructions].filter(Boolean).join(' - ') || t('caregiver.patientHub.noInstructions'))
                    : (med.instructions || t('caregiver.patientHub.noInstructions'));

                  return (
                    <div key={med.id || med._id || `med-${index}`} className="p-4 bg-surface-container-low rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-on-surface text-base">{med.name}</h3>
                        <p className="text-xs text-on-surface-variant">
                          {dosageText ? `${dosageText} • ` : ''}{instructionsText}
                        </p>
                      </div>

                      <AppBadge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 me-1 inline" />
                        {typeof med.frequency === 'object' ? (med.frequency.type || 'Daily') : (med.frequency || 'Daily')}
                      </AppBadge>
                    </div>
                  );
                })}
              </div>
            )}
          </AppCard>
        </div>
      </div>
    </div>
  );
}

export default CaregiverPatientDetailComponent;
