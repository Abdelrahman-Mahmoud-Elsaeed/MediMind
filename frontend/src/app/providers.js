'use client';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    originalError.apply(console, args);
  };
}

import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '../store';
import { LanguageProvider } from '../shared/lib/i18nContext';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MedicationAlarmManager from '../modules/dose/components/MedicationAlarmManager';

function AuthInitializer({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/dashboard', '/medications', '/pharmacies'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route || (route !== '/' && pathname?.startsWith(`${route}/`)));

    if (isAuthenticated && user) {
      const isVerified = user.isEmailVerified || user.isPhoneVerified || user.isVerified;
      const userRole = String(user.role).toUpperCase();

      if (pathname === '/pharmacy' || pathname?.startsWith('/pharmacy/')) {
        if (userRole !== 'PHARMACIST' && userRole !== 'ADMIN') {
          router.replace(userRole === 'PATIENT' ? '/home' : '/dashboard');
          return;
        }
      }

      if (!isVerified) {
        if (pathname !== '/verify') {
          router.replace('/verify');
        }
      } else {
        if (pathname === '/verify') {
          router.replace(userRole === 'PATIENT' ? '/home' : userRole === 'PHARMACIST' ? '/pharmacy' : '/dashboard');
        }
      }
    } else if (!isAuthenticated && !isPublicRoute && pathname !== '/verify') {
      router.replace('/login');
    }
  }, [isAuthenticated, user, isAuthLoading, pathname, router]);

  return (
    <>
      {children}
      {isAuthenticated && <MedicationAlarmManager />}
    </>
  );
}

export function Providers({ children, locale }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider initialLocale={locale}>
            <AuthInitializer>
              {children}
            </AuthInitializer>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}
