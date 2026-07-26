import React from "react";
import { useRTL } from "../hooks/useRTL";

export function RegistrationFooter() {
  const { t } = useRTL();

  return (
    <footer className="mt-auto pt-6 flex items-center justify-center gap-2 text-xs md:text-sm font-medium text-on-surface-variant font-['JetBrains_Mono'] pb-8 select-none">
      <span className="material-symbols-outlined text-[18px]">lock</span>
      <span>{t("auth.register.secureEncryption")}</span>
    </footer>
  );
}
