'use client';

import React from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import {
  WelcomeBanner,
  TimelineCard,
  HealthSummary,
  CaregiverCard,
  QuickActions,
} from '@/modules/dashboard';
import { DashboardMedicationCabinet as MedicationCabinet } from '@/modules/medication';

export default function PatientHome(): React.JSX.Element {
  return (
    <MainLayout activePath="/home">
      {/* Container with optimal maximum width */}
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Hero Welcome Banner */}
        <WelcomeBanner />

        {/* Dashboard CSS Grid Layout (Left 2fr, Right 1fr, Gap 24px) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN (2fr) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Timeline Card */}
            <TimelineCard />

            {/* Medication Cabinet List View */}
            <MedicationCabinet />
          </div>

          {/* RIGHT COLUMN (1fr) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Health Summary Panel / Biometric Waveform */}
            <HealthSummary />

            {/* Caregivers Circle Card */}
            <CaregiverCard />
          </div>
        </div>

        {/* Bottom Quick Action Cards */}
        <QuickActions />
      </div>
    </MainLayout>
  );
}
