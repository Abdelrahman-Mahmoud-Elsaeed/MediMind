'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/sidebar/Sidebar';
import {
  Header,
  WelcomeBanner,
  TimelineCard,
  HealthSummary,
  CaregiverCard,
  QuickActions,
} from '@/modules/dashboard';
import { DashboardMedicationCabinet as MedicationCabinet } from '@/modules/medication';
import { useTranslation } from '@/shared/lib/i18nContext';

export default function PatientHome(): React.JSX.Element {
  const { dir } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerDir = mounted ? dir : 'ltr';

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans antialiased" dir={containerDir} suppressHydrationWarning>
      {/* Sidebar Component (280px width) on Left */}
      <Sidebar activePath="/home" />

      {/* Main Dashboard Content Area (Full width flex-1) */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen overflow-y-auto">
        {/* Container with optimal maximum width */}
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Top Header Controls (Notifications, Dark Mode) */}
          <Header />

          {/* Hero Welcome Banner (180px height, 24px radius) */}
          <WelcomeBanner />

          {/* Dashboard CSS Grid Layout (Left 2fr, Right 1fr, Gap 24px) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN (2fr) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Timeline Card */}
              <TimelineCard />

              {/* Medication Cabinet Card with Live API Integration */}
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
      </main>
    </div>
  );
}
