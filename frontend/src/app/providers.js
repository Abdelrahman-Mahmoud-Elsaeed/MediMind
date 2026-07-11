'use client';

import { Provider, useDispatch } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '../store';
import { LanguageProvider } from '../shared/lib/i18nContext';
import { useEffect } from 'react';
import { checkAuthThunk } from '../modules/auth/store/authActions';

function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);

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
