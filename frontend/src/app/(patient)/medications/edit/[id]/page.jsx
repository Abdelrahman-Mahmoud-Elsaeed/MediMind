'use client';

import React, { use } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import EditMedicationComponent from '@/modules/medication/components/EditMedicationComponent';

export default function EditMedicationPage({ params }) {
  const unwrappedParams = params && typeof params.then === 'function' ? use(params) : params;
  const medicationId = unwrappedParams?.id;

  return (
    <MainLayout activePath="/medications">
      <EditMedicationComponent medicationId={medicationId} />
    </MainLayout>
  );
}
