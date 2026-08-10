'use client';

import React from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import PatientHome from '../home/PatientHome';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { CaregiverDashboardComponent } from '@/modules/caregiver/components/CaregiverDashboardComponent';

export default function DashboardPage() {
  const { user } = useAuth();

  const isCaregiver = ['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(user?.role);

  if (isCaregiver) {
    return (
      <MainLayout activePath="/dashboard">
        <CaregiverDashboardComponent />
      </MainLayout>
    );
  }

  return <PatientHome />;
}
