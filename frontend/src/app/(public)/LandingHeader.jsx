'use client';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '@/modules/auth/store/authActions';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useTheme } from 'next-themes';
import { LanguageToggler } from '@/shared/components/LanguageToggler';
import { Button, Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { User, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { usePatientProfileQuery } from '@/modules/patient/hooks/usePatientQueries';
import { useCaregiverProfileQuery } from '@/modules/caregiver/hooks/useCaregiverQueries';

export default function LandingHeader() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isCaregiver = ['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(user?.role);
  const isPatient = user?.role === 'PATIENT' || (!user?.role && isAuthenticated);

  const { data: patientProfile } = usePatientProfileQuery({ enabled: isPatient });
  const { data: caregiverProfile } = useCaregiverProfileQuery({ enabled: isCaregiver });

  const activeProfile = isCaregiver ? caregiverProfile : patientProfile;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserLoggedIn = Boolean(
    isAuthenticated ||
    user ||
    (typeof window !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('user')))
  );

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

  const profilePic = activeProfile?.profilePictureUrl || user?.profilePictureUrl || '';
  const userDisplayName = activeProfile?.firstName && activeProfile?.lastName
    ? `${activeProfile.firstName} ${activeProfile.lastName}`
    : user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || user?.email?.split('@')[0] || (locale === 'ar' ? 'حساب مقدم الرعاية' : 'Caregiver Profile');

  const userAvatarLetter = (userDisplayName?.[0] || 'C').toUpperCase();

  const userRolePath = isCaregiver ? '/dashboard' : user?.role === 'ADMIN' ? '/admin-dashboard' : '/home';

  const userRoleLabel = user?.role === 'FAMILY_CAREGIVER'
    ? (locale === 'ar' ? 'مقدم رعاية عائلي' : 'Family Caregiver')
    : user?.role === 'PROFESSIONAL_CAREGIVER'
    ? (locale === 'ar' ? 'مقدم رعاية محترف' : 'Professional Caregiver')
    : user?.role === 'CAREGIVER'
    ? (locale === 'ar' ? 'مقدم رعاية' : 'Caregiver')
    : user?.role === 'ADMIN'
    ? (locale === 'ar' ? 'مسؤول النظام' : 'Administrator')
    : (locale === 'ar' ? 'مريض' : 'Patient');

  return (
    <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm" suppressHydrationWarning>
      <div className="flex justify-between items-center px-4 sm:px-8 md:px-12 h-20 max-w-[1440px] mx-auto">
        <Link href="/" className="text-2xl font-black flex items-center gap-2.5 group">
          <img
            src="/images/logo.png"
            alt="MediMind Logo"
            className="h-10 w-auto object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="tracking-tight">
            <span className="text-[#0047ba] dark:text-[#60a5fa]">Medi</span>
            <span className="text-[#00a396] dark:text-[#34d399]">Mind</span>
          </span>
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

          {/* User Profile Avatar / Sign In Options */}
          <div className="flex items-center gap-3 ml-2" suppressHydrationWarning>
            {mounted && isUserLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer group outline-none shadow-xs hover:shadow-md hover:border-teal-400 dark:hover:border-teal-500">
                    <div className="relative">
                      <Avatar className="w-8 h-8 ring-2 ring-teal-500/50 group-hover:ring-teal-600 transition-all">
                        {profilePic ? <AvatarImage src={profilePic} alt={userDisplayName} className="object-cover" /> : null}
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-700 text-white font-black text-xs">
                          {userAvatarLetter}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>

                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 max-w-[120px] truncate group-hover:text-teal-700 dark:group-hover:text-teal-400">
                      {userDisplayName}
                    </span>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                  <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center gap-3 bg-teal-50/50 dark:bg-teal-950/30 rounded-xl">
                    <Avatar className="w-10 h-10 ring-2 ring-teal-500/40">
                      {profilePic ? <AvatarImage src={profilePic} alt={userDisplayName} className="object-cover" /> : null}
                      <AvatarFallback className="bg-teal-600 text-white font-extrabold text-sm">
                        {userAvatarLetter}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {userDisplayName}
                      </p>
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider truncate">
                        {userRoleLabel}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 cursor-pointer">
                      <User className="w-4 h-4 text-teal-600" />
                      <span>{locale === 'ar' ? 'الملف الشخصي' : 'My Profile'}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={userRolePath} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 text-teal-600" />
                      <span>{locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
                    </Link>
                  </DropdownMenuItem>

                  {!isPatient && (
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 cursor-pointer">
                        <Settings className="w-4 h-4 text-teal-600" />
                        <span>{locale === 'ar' ? 'الإعدادات' : 'Settings'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <span>{t('landing.nav.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : mounted && !isUserLoggedIn ? (
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
            ) : null}
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
                    {profilePic ? <AvatarImage src={profilePic} alt={userDisplayName} className="object-cover" /> : null}
                    <AvatarFallback className="bg-teal-600 text-white font-bold">
                      {userAvatarLetter}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{userDisplayName}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">{userRoleLabel}</p>
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
