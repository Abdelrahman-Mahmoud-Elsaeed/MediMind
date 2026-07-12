"use client";

import Link from "next/link";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useCareCircle } from "../hooks/useCareCircle";

export default function CareCircleComponent() {
  const { t, locale, toggleLanguage } = useTranslation();

  const {
    loading,
    error,
    submitting,
    emailInput,
    setEmailInput,
    canManageMeds,
    setCanManageMeds,
    canViewRecords,
    setCanViewRecords,
    activeCaregivers,
    pendingInvitations,
    sendInvitation,
    revokeRelationship,
    validationError
  } = useCareCircle();

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    sendInvitation(e);
  };

  const handleDisconnectClick = (relationshipId) => {
    if (confirm(locale === "ar" ? "هل أنت متأكد من قطع الاتصال مع هذا الشخص؟" : "Are you sure you want to disconnect this caregiver?")) {
      revokeRelationship(relationshipId);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
            M
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">MediMind</h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-container/20 border border-primary/30 text-primary transition-all duration-200"
        >
          {locale === "en" ? "العربية" : "EN"}
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-8">
        <section className="space-y-2">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{t("patient.care.title")}</h2>
          <p className="text-on-surface-variant font-body-md">
            {t("patient.care.subtitle")}
          </p>
        </section>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading care circle...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column: Active & Pending Caregivers */}
            <div className="lg:col-span-8 space-y-6">
              {/* Active Caregivers */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">group</span>
                    {t("patient.care.activeCaregivers")}
                  </h3>
                  <span className="bg-secondary-container/20 text-secondary px-3 py-0.5 rounded-full text-xs font-bold border border-secondary/15">
                    {activeCaregivers.length} {locale === "ar" ? "متصل" : "Connected"}
                  </span>
                </div>

                {activeCaregivers.length > 0 ? (
                  <div className="space-y-4">
                    {activeCaregivers.map((r) => {
                      const cg = r.caregiverId;
                      const initial = cg?.firstName ? cg.firstName.charAt(0).toUpperCase() : "C";
                      const fullName = cg ? `${cg.firstName} ${cg.lastName}` : "Unknown Caregiver";
                      const phoneText = cg?.phone ? ` • ${cg.phone}` : "";

                      return (
                        <div
                          key={r.relationshipId}
                          className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6 transition-all hover:border-primary/20"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                                {initial}
                              </div>
                              <div>
                                <h4 className="font-headline-md text-base font-bold text-on-surface">{fullName}</h4>
                                <p className="text-on-surface-variant text-xs mt-0.5">{phoneText}</p>
                                <div className="flex items-center gap-1.5 mt-2 text-secondary text-xs font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                  {t("patient.care.connected")}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {r.permissions?.canAddMedication && (
                                <span className="bg-surface-variant/50 text-on-surface-variant px-3 py-1 rounded-lg text-xs border border-outline-variant/10">
                                  {t("patient.care.manageMeds")}
                                </span>
                              )}
                              {r.permissions?.canViewMedicalRecords && (
                                <span className="bg-surface-variant/50 text-on-surface-variant px-3 py-1 rounded-lg text-xs border border-outline-variant/10">
                                  {t("patient.care.viewRecords")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-6 pt-6 border-t border-outline-variant/10 flex gap-3">
                            <button
                              onClick={() => handleDisconnectClick(r.relationshipId)}
                              className="px-4 py-2 border border-error/25 text-error rounded-xl font-label-sm text-xs font-bold hover:bg-error/10 transition-all"
                            >
                              {t("patient.care.disconnect")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-surface-container border border-dashed border-outline-variant/30 rounded-2xl p-8 text-center text-slate-500">
                    No active caregivers. Invite a caregiver to start collaborating.
                  </div>
                )}
              </section>

              {/* Pending Invitations */}
              <section className="space-y-4">
                <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-xl">hourglass_top</span>
                  {t("patient.care.pendingInvites")}
                </h3>

                {pendingInvitations.length > 0 ? (
                  <div className="space-y-4">
                    {pendingInvitations.map((r) => {
                      const cg = r.caregiverId;
                      const initial = cg?.firstName ? cg.firstName.charAt(0).toUpperCase() : "C";
                      const fullName = cg ? `${cg.firstName} ${cg.lastName}` : "Pending Caregiver";

                      return (
                        <div
                          key={r.relationshipId}
                          className="bg-surface-container border border-dashed border-outline-variant/40 rounded-2xl p-6"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary text-xl font-bold">
                                {initial}
                              </div>
                              <div>
                                <h4 className="font-headline-md text-base font-bold text-on-surface">{fullName}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-tertiary text-xs font-bold uppercase tracking-wider">
                                    {locale === "ar" ? "معلقة" : "Pending"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex flex-wrap gap-2 justify-end">
                                {r.permissions?.canAddMedication && (
                                  <span className="bg-tertiary/5 text-tertiary px-3 py-1 rounded-lg text-xs border border-tertiary/15">
                                    {locale === "ar" ? "أدوية" : "Meds"}
                                  </span>
                                )}
                                {r.permissions?.canViewMedicalRecords && (
                                  <span className="bg-tertiary/5 text-tertiary px-3 py-1 rounded-lg text-xs border border-tertiary/15">
                                    {locale === "ar" ? "سجلات" : "Records"}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => revokeRelationship(r.relationshipId)}
                                className="text-error font-label-sm text-xs hover:underline mt-1"
                              >
                                {t("patient.care.cancelInvite")}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-surface-container border border-dashed border-outline-variant/30 rounded-2xl p-8 text-center text-slate-500">
                    No pending invitations.
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Invite Form */}
            <section className="lg:col-span-4 bg-surface-container border border-outline-variant/10 rounded-2xl p-6 shadow-xl h-fit">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface mb-1">{t("patient.care.addToCircle")}</h3>
              <p className="text-on-surface-variant text-xs mb-6">{t("patient.care.inviteDesc")}</p>
              
              {validationError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-xs font-bold mb-4">
                  {validationError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleInviteSubmit}>
                <div className="space-y-1.5">
                  <label className="text-on-surface text-xs font-bold block px-1">{t("patient.care.email")}</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="caregiver@example.com"
                  />
                </div>

                {/* Permission Switches */}
                <div className="space-y-3 pt-2">
                  <p className="text-on-surface text-xs font-bold block px-1">{t("patient.care.permissions")}</p>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-outline-variant/10">
                    <span className="text-on-surface-variant text-sm font-medium">{t("patient.care.manageMeds")}</span>
                    <button
                      type="button"
                      onClick={() => setCanManageMeds(!canManageMeds)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        canManageMeds ? "bg-primary-container" : "bg-outline-variant/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          canManageMeds ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-outline-variant/10">
                    <span className="text-on-surface-variant text-sm font-medium">{t("patient.care.viewRecords")}</span>
                    <button
                      type="button"
                      onClick={() => setCanViewRecords(!canViewRecords)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        canViewRecords ? "bg-primary-container" : "bg-outline-variant/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          canViewRecords ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  {submitting ? t("patient.care.sendingInvite") : t("patient.care.sendInvite")}
                </button>
                <p className="text-center text-on-surface-variant/50 text-[10px] px-2 leading-normal mt-2">
                  Invitations are valid for 7 days. Shared data is encrypted and secure.
                </p>
              </form>
            </section>
          </div>
        )}
      </main>

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
        <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/caregivers">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.care")}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/profile">
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm">{t("patient.nav.profile")}</span>
        </Link>
      </nav>
    </div>
  );
}
