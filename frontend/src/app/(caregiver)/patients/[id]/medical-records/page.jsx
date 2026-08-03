'use client';

import React from 'react';
import { use } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { CaregiverPatientRecordsComponent } from '@/modules/caregiver/components/CaregiverPatientRecordsComponent';

export default function CaregiverPatientMedicalRecordsPage({ params }) {
  const resolvedParams = use(params);
  const patientId = resolvedParams?.id;

  return (
    <MainLayout activePath="/patients">
      <CaregiverPatientRecordsComponent patientId={patientId} />
    </MainLayout>
  );
}
