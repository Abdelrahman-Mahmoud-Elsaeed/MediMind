'use client';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '@/modules/auth/store/authActions';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useTheme } from 'next-themes';
import { LanguageToggler } from '@/shared/components/LanguageToggler';
import { Button, Avatar, AvatarFallback } from '@/shared/components/ui';

export default function LandingHeader() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logoutThunk());
  };

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const userDisplayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || user?.email || 'User Profile';
  const userAvatarLetter = (user?.firstName?.[0] || user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const userRolePath = user?.role === 'PATIENT' ? '/home' : user?.role ? '/dashboard' : '/home';

  return (
    <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm" suppressHydrationWarning>
      <div className="flex justify-between items-center px-4 sm:px-8 md:px-12 h-20 max-w-[1440px] mx-auto">
        <Link href="/" className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
            medical_services
          </span>
          <span>MediMind</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="text-slate-600 dark:text-slate-300 font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t('landing.nav.features')}
            </a>
            <a href="#caregivers" onClick={(e) => handleSmoothScroll(e, 'caregivers')} className="text-slate-600 dark:text-slate-300 font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t('landing.nav.caregivers')}
            </a>
            <a href="#plant-journey" onClick={(e) => handleSmoothScroll(e, 'plant-journey')} className="text-slate-600 dark:text-slate-300 font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t('landing.nav.plantJourney')}
            </a>
            <a href="#faq" onClick={(e) => handleSmoothScroll(e, 'faq')} className="text-slate-600 dark:text-slate-300 font-medium hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {t('landing.nav.faq')}
            </a>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />

          {/* Language & Theme Controls */}
          <div className="flex items-center gap-4">
            <LanguageToggler />

            {/* Dark Mode Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-outlined !text-[22px]">
                {mounted && resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-3 ml-2">
            {mounted && (isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href={userRolePath} className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:border-teal-400 transition-all group">
                  <Avatar className="w-8 h-8 border-none">
                    <AvatarFallback className="bg-teal-600 text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                      {userAvatarLetter}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left pr-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate leading-tight">
                      {userDisplayName}
                    </p>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium capitalize leading-tight">
                      {user?.role?.toLowerCase() || 'Member'}
                    </p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 text-xs font-semibold px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('landing.nav.signOut')}
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-teal-700 dark:text-teal-400 font-bold px-4 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-full" asChild>
                  <Link href="/login">
                    {t('landing.nav.signIn')}
                  </Link>
                </Button>
                <Button variant="default" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-bold shadow-md" asChild>
                  <Link href="/register">
                    {t('landing.nav.getStarted')}
                  </Link>
                </Button>
              </>
            ))}
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined !text-[22px]">
              {mounted && resolvedTheme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="block py-2 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600">
            {t('landing.nav.features')}
          </a>
          <a href="#caregivers" onClick={(e) => handleSmoothScroll(e, 'caregivers')} className="block py-2 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600">
            {t('landing.nav.caregivers')}
          </a>
          <a href="#plant-journey" onClick={(e) => handleSmoothScroll(e, 'plant-journey')} className="block py-2 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600">
            {t('landing.nav.plantJourney')}
          </a>
          <a href="#faq" onClick={(e) => handleSmoothScroll(e, 'faq')} className="block py-2 text-slate-700 dark:text-slate-200 font-medium hover:text-teal-600">
            {t('landing.nav.faq')}
          </a>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Language / اللغة</span>
            <LanguageToggler />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {mounted && (isAuthenticated ? (
              <div className="space-y-3">
                <Link href={userRolePath} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                  <Avatar className="w-10 h-10 border-none">
                    <AvatarFallback className="bg-teal-600 text-white font-bold">
                      {userAvatarLetter}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{userDisplayName}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 capitalize">{user?.role?.toLowerCase() || 'Member'}</p>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                >
                  {t('landing.nav.signOut')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="w-full py-2.5 text-teal-700 dark:text-teal-400 font-bold border-teal-600 rounded-full" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    {t('landing.nav.signIn')}
                  </Link>
                </Button>
                <Button variant="default" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full shadow" asChild>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    {t('landing.nav.getStarted')}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
