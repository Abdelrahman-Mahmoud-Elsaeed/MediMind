'use client';

import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { CaregiverPatientsListComponent } from '@/modules/caregiver/components/CaregiverPatientsListComponent';

export default function CaregiverPatientsPage() {
  return (
    <MainLayout activePath="/patients">
      <CaregiverPatientsListComponent />
    </MainLayout>
  );
}
