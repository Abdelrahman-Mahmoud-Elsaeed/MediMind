'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/sidebar/Sidebar';
import { Header } from '@/shared/components/header/Header';
import { MobileNav } from '@/shared/components/navigation/MobileNav';
import { useTranslation } from '@/shared/lib/i18nContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activePath = '/home',
}) => {
  const { dir } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerDir = mounted ? dir : 'ltr';

  return (
    <div
      className="min-h-screen w-full bg-background text-on-surface flex font-sans antialiased"
      dir={containerDir}
      suppressHydrationWarning
    >
      {/* Shared Desktop Application Sidebar (280px width) on Left */}
      <Sidebar activePath={activePath} />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 lg:pb-0">
        {/* Fixed Shared Top Application Header */}
        <Header />

        {/* Page Specific Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Shared Bottom Mobile Navigation Bar */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;
