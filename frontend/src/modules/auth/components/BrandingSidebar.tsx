"use client";

import React from "react";
import { useTranslation } from "@/shared/lib/i18nContext";
import Branding from "./Branding";

export default function BrandingSidebar() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex w-full select-none">
      <Branding
        title={t("auth.register.step1Subtitle")}
        description={t("auth.register.roleInfo")}
        features={[
          { icon: "medication", text: t("patient.nav.meds") },
          { icon: "group", text: t("patient.nav.care") },
          { icon: "insights", text: t("patient.nav.adherence") },
          { icon: "shield", text: t("patient.records.secureVault") },
        ]}
        variant="register"
      />
    </div>
  );
}