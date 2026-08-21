'use client';

import React from 'react';
import MainLayout from '@/shared/components/layout/MainLayout';
import CaregiverProfileComponent from '@/modules/caregiver/components/CaregiverProfileComponent';

export default function CaregiverProfile() {
  return (
    <MainLayout>
      <CaregiverProfileComponent />
    </MainLayout>
  );
}
