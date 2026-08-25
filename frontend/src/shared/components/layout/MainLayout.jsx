'use client';
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/sidebar/Sidebar';
import { Header } from '@/shared/components/header/Header';
import { MobileNav } from '@/shared/components/navigation/MobileNav';
import { useTranslation } from '@/shared/lib/i18nContext';

export const MainLayout = ({ children, activePath = '/home' }) => {
    const { dir } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [isSidebarSlim, setIsSidebarSlimState] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem('medimind_sidebar_slim');
            if (saved !== null) {
                setIsSidebarSlimState(JSON.parse(saved));
            }
        } catch (e) {
            // Ignore SSR / localStorage errors
        }
    }, []);

    const setIsSidebarSlim = (value) => {
        setIsSidebarSlimState((prev) => {
            const nextValue = typeof value === 'function' ? value(prev) : value;
            try {
                localStorage.setItem('medimind_sidebar_slim', JSON.stringify(nextValue));
            } catch (e) {
                // Ignore localStorage errors
            }
            return nextValue;
        });
    };

    const containerDir = dir || 'ltr';

    return (
      <div className="min-h-screen w-full bg-background text-on-surface flex font-sans antialiased" dir={containerDir} suppressHydrationWarning>
        {/* Desktop Application Sidebar */}
        {mounted ? (
          <Sidebar activePath={activePath} isSidebarSlim={isSidebarSlim} setIsSidebarSlim={setIsSidebarSlim} />
        ) : (
          <aside className="hidden lg:flex shrink-0 h-screen sticky top-0 bg-surface-container-lowest dark:bg-surface-container-low border-r border-outline-variant/30 w-[280px] p-6" />
        )}

        {/* Main Container Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 lg:pb-0" suppressHydrationWarning>
          {/* Fixed Top Application Header */}
          <Header />

          {/* Page Specific Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>

        {/* Bottom Mobile Navigation Bar */}
        {mounted && <MobileNav />}
      </div>
    );
};
export default MainLayout;
