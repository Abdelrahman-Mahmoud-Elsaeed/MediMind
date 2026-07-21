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
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { checkAuthThunk } from '../modules/auth/store/authActions';

function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname?.startsWith(`${route}/`));
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');

    // Do not fire token refresh on public unauthenticated pages
    if (!isPublicRoute || hasToken) {
      dispatch(checkAuthThunk());
    }
  }, [dispatch, pathname]);

  // Lock Guard Redirection for Unverified Accounts
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname?.startsWith(`${route}/`));

    if (isAuthenticated && user) {
      const isVerified = user.isEmailVerified || user.isPhoneVerified || user.isVerified;
      
      if (!isVerified) {
        // Unverified users are locked out of home and can only access verify-email
        if (pathname !== '/verify-email') {
          router.replace('/verify-email');
        }
      } else {
        // Verified users cannot access verify-email, send them to app home/dashboard
        if (pathname === '/verify-email') {
          router.replace(user.role === 'PATIENT' ? '/home' : '/dashboard');
        }
      }
    } else if (!isAuthenticated && !isPublicRoute && pathname !== '/verify-email') {
      // Unauthenticated users are redirected to login page
      router.replace('/login');
    }
  }, [isAuthenticated, user, loading, pathname, router]);

  return <>{children}</>;
}

export function Providers({ children, locale }) {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider initialLocale={locale}>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}
