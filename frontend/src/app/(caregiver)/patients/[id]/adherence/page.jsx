'use client';

import React from 'react';
import { use } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { CaregiverPatientAdherenceComponent } from '@/modules/caregiver/components/CaregiverPatientAdherenceComponent';

export default function CaregiverPatientAdherencePage({ params }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams?.id;

  return (
    <MainLayout activePath="/patients">
      <CaregiverPatientAdherenceComponent patientId={patientId} />
    </MainLayout>
  );
}
