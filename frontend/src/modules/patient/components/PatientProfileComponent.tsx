"use client";

import Link from "next/link";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientProfile } from "../hooks/usePatientProfile";

export default function PatientProfileComponent() {
  const { user } = useAuth();
  const userName = user?.name || "Sarah Smith";
  const userEmail = user?.email || "sarah.smith@example.com";

  const { t, locale, toggleLanguage } = useTranslation();

  const {
    profile,
    caregiver,
    loading,
    error,
    isEditing,
    setIsEditing,
    saving,
    validationError,
    phone,
    dob,
    setDob,
    bloodType,
    setBloodType,
    ecName,
    setEcName,
    ecPhone,
    setEcPhone,
    updateProfile
  } = usePatientProfile();

  const calculateAge = (dobString) => {
    if (!dobString) return "N/A";
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
            M
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">{t("patient.profile.title")}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary/30 text-primary transition-all duration-200"
          >
            {locale === "en" ? "العربية" : "EN"}
          </button>
          <Link href="/notifications" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all duration-200">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading profile...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Identity Section */}
            <section className="lg:col-span-4 space-y-4">
              <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary text-3xl font-bold">
                    {userName.charAt(0)}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                </div>
                <h3 className="font-headline-md text-body-lg font-bold text-on-surface">{userName}</h3>
                <p className="font-label-md text-label-md text-on-surface-variant/80 mt-1">{userEmail}</p>
                <p className="font-label-md text-label-md text-on-surface-variant/80">{phone}</p>
                <div className="flex justify-center gap-2 mt-4 w-full">
                  <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/25">
                    {t("patient.profile.blood")}: {profile?.bloodType || "N/A"}
                  </span>
                  <span className="bg-secondary/15 text-secondary px-3 py-1 rounded-full text-xs font-bold border border-secondary/25">
                    {t("patient.profile.age")}: {calculateAge(profile?.dateOfBirth)}
                  </span>
                </div>
              </div>

              {/* Primary Caregiver Card */}
              <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 border-l-4 border-l-secondary">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-headline-md text-sm font-bold text-on-surface uppercase tracking-wider">
                    {t("patient.profile.caregiverLink")}
                  </h4>
                  <span className="material-symbols-outlined text-secondary">health_and_safety</span>
                </div>
                {caregiver ? (
                  <div className="flex items-center gap-4 bg-background/50 p-4 rounded-xl border border-outline-variant/5">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                      {caregiver.firstName ? caregiver.firstName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-label-md font-bold text-on-surface">
                        {caregiver.firstName} {caregiver.lastName}
                      </p>
                      <p className="font-label-sm text-label-sm text-secondary">{locale === "ar" ? "متصل" : "Connected"}</p>
                    </div>
                    <Link href="/caregivers" className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg font-label-sm text-xs font-bold transition-all hover:brightness-105 active:scale-95">
                      {t("patient.profile.manage")}
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-2 text-on-surface-variant/60 text-xs">
                    No connected caregivers.
                    <div className="mt-2">
                      <Link href="/caregivers" className="text-primary font-bold hover:underline">
                        Invite Caregiver
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Navigation Rows */}
            <section className="lg:col-span-8 space-y-4">
              <div className="bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden divide-y divide-outline-variant/10">
                {/* Row 1: Personal Info */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center p-5 gap-4 hover:bg-surface-container-high transition-colors text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-headline-md text-base font-bold text-on-surface">{t("patient.profile.personalInfo")}</h4>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5">{t("patient.profile.personalDesc")}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </button>

                {/* Row 2: Medical Conditions & Records Hub */}
                <Link href="/medical-records" className="w-full flex items-center p-5 gap-4 hover:bg-surface-container-high transition-colors text-left group">
                  <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined">list_alt</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-headline-md text-base font-bold text-on-surface">{t("patient.profile.medicalConditions")}</h4>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5">{t("patient.profile.conditionsDesc")}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </Link>

                {/* Row 3: Medical Records Attachment Vault */}
                <Link href="/medical-records" className="w-full flex items-center p-5 gap-4 hover:bg-surface-container-high transition-colors text-left group">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined">folder_shared</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-headline-md text-base font-bold text-on-surface">{t("patient.profile.medicalRecords")}</h4>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5">{t("patient.profile.recordsDesc")}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                </Link>
              </div>

              {/* Insights Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container border border-outline-variant/10 p-5 rounded-2xl border-t-4 border-t-primary">
                  <span className="material-symbols-outlined text-primary mb-2">help_center</span>
                  <h5 className="font-headline-md text-sm font-bold text-on-surface">Help Center</h5>
                  <p className="text-xs text-on-surface-variant mt-1">Need assistance? Access our 24/7 support guides.</p>
                </div>
                <div className="bg-surface-container border border-outline-variant/10 p-5 rounded-2xl border-t-4 border-t-error">
                  <span className="material-symbols-outlined text-error mb-2">gpp_maybe</span>
                  <h5 className="font-headline-md text-sm font-bold text-on-surface">Data Privacy</h5>
                  <p className="text-xs text-on-surface-variant mt-1">Review how your clinical data is encrypted and protected.</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Edit Profile Modal overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/10 p-6 rounded-2xl max-w-md w-full space-y-4">
            <h3 className="font-headline-md text-body-lg font-bold text-on-surface">{t("patient.profile.editDetails")}</h3>
            
            {validationError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-bold">
                {validationError}
              </div>
            )}

            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 outline-none text-on-surface focus:ring-2 focus:ring-primary"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 outline-none text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="border-t border-outline-variant/10 pt-3">
                <p className="text-xs font-bold text-on-surface-variant mb-2">Emergency Contact</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={ecName}
                    onChange={(e) => setEcName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 outline-none text-on-surface focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={ecPhone}
                    onChange={(e) => setEcPhone(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 outline-none text-on-surface focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 border border-outline-variant text-on-surface font-bold rounded-xl hover:bg-surface-variant/25 transition-all text-xs"
                >
                  {t("patient.profile.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs disabled:opacity-50"
                >
                  {saving ? t("patient.profile.saving") : t("patient.profile.saveDetails")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/home">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.home")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/medications">
          <span className="material-symbols-outlined">medication</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.meds")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/adherence">
          <span className="material-symbols-outlined">query_stats</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.adherence")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/caregivers">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.care")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/profile">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.profile")}</span>
        </Link>
      </nav>
    </div>
  );
}
