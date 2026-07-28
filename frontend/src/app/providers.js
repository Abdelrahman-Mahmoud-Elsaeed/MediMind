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
import { checkAuthThunk } from '../modules/auth/store/authActions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname?.startsWith(`${route}/`));
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');

    if (!isPublicRoute || hasToken) {
      dispatch(checkAuthThunk());
    }
  }, [dispatch, pathname]);

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/dashboard', '/medications'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route || (route !== '/' && pathname?.startsWith(`${route}/`)));

    if (isAuthenticated && user) {
      const isVerified = user.isEmailVerified || user.isPhoneVerified || user.isVerified;

      if (!isVerified) {
        if (pathname !== '/verify') {
          router.replace('/verify');
        }
      } else {
        if (pathname === '/verify') {
          router.replace(user.role === 'PATIENT' ? '/home' : '/dashboard');
        }
      }
    } else if (!isAuthenticated && !isPublicRoute && pathname !== '/verify') {
      router.replace('/login');
    }
  }, [isAuthenticated, user, loading, pathname, router]);

  return <>{children}</>;
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
