'use client';

import React from 'react';
import { use } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { CaregiverPatientDetailComponent } from '@/modules/caregiver/components/CaregiverPatientDetailComponent';

export default function CaregiverPatientDetailPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? use(params) : params;
  const patientId = resolvedParams?.id;

  return (
    <MainLayout activePath="/patients">
      <CaregiverPatientDetailComponent patientId={patientId} />
    </MainLayout>
  );
}
