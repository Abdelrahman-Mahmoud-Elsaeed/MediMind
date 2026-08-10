'use client';

import React from 'react';
import { use } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { CaregiverPatientMedicationsComponent } from '@/modules/caregiver/components/CaregiverPatientMedicationsComponent';

export default function CaregiverPatientMedicationsPage({ params }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams?.id;

  return (
    <MainLayout activePath="/patients">
      <CaregiverPatientMedicationsComponent patientId={patientId} />
    </MainLayout>
  );
}
