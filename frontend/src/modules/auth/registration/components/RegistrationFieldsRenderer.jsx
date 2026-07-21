import React from "react";
import { useRTL } from "../hooks/useRTL";
import { CAREGIVER_RELATIONS, BLOOD_TYPES } from "../constants/roles";
import { PhoneInput } from "./PhoneInput";
import { PasswordInput } from "./PasswordInput";
import { RoleCard } from "./RoleCard";
import { FormField } from "./FormField";

export function RegistrationFieldsRenderer({
  currentStep,
  formData,
  handleChange,
  handleBlur,
  handleRoleSelect,
  errors,
  touchedFields,
  showPassword,
  onTogglePassword,
  isPhoneInput,
  countrySelectorProps,
}) {
  const { isRtl, t } = useRTL();

  return (
    <>
      {/* ================= STEP 1 ================= */}
      {currentStep === 1 && (
        <>
          <PhoneInput
            id="loginInput"
            value={formData.loginInput}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.loginInput}
            touched={touchedFields.loginInput}
            isPhoneInput={isPhoneInput}
            countrySelectorProps={countrySelectorProps}
          />

          <PasswordInput
            id="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            touched={touchedFields.password}
            showPassword={showPassword}
            onTogglePassword={onTogglePassword}
          />

          <div className="pt-2">
            <span className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-3">
              {t("auth.register.roleTitle")}
            </span>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <RoleCard
                roleKey="patient"
                icon="person"
                title={t("auth.register.patientRole")}
                isSelected={formData.role === "patient"}
                onClick={() => handleRoleSelect("patient")}
              />
              <RoleCard
                roleKey="caregiver"
                icon="favorite"
                title={t("auth.register.caregiverRole")}
                isSelected={formData.role === "caregiver"}
                onClick={() => handleRoleSelect("caregiver")}
              />
            </div>
          </div>
        </>
      )}

      {/* ================= STEP 2 ================= */}
      {currentStep === 2 && (
        <>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <FormField
              id="firstName"
              label={t("auth.register.firstNameLabel")}
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.firstName}
              touched={touchedFields.firstName}
              placeholder={t("auth.register.firstNamePlaceholder")}
              icon="badge"
              required
            />
            <FormField
              id="lastName"
              label={t("auth.register.lastNameLabel")}
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.lastName}
              touched={touchedFields.lastName}
              placeholder={t("auth.register.lastNamePlaceholder")}
              icon="badge"
              required
            />
          </div>

          {isPhoneInput ? (
            <FormField
              id="email"
              type="email"
              label={t("auth.register.emailLabelOptional")}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touchedFields.email}
              placeholder={t("auth.register.emailPlaceholder")}
              icon="mail"
              dir="ltr"
            />
          ) : (
            <PhoneInput
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              touched={touchedFields.phone}
              isPhoneInput={true}
              countrySelectorProps={countrySelectorProps}
              label={t("auth.register.phoneLabel")}
              placeholder={t("auth.register.phonePlaceholder")}
              required={false}
            />
          )}

          {formData.role === "caregiver" ? (
            <>
              <FormField
                id="relation"
                type="select"
                label={t("auth.register.relationshipLabel")}
                value={formData.relation}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.relation}
                touched={touchedFields.relation}
                icon="family_history"
              >
                {CAREGIVER_RELATIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {t(`auth.register.relations.${rel}`) || rel}
                  </option>
                ))}
              </FormField>

              <FormField
                id="patientCode"
                label={t("auth.register.patientCodeLabel")}
                value={formData.patientCode}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.patientCode}
                touched={touchedFields.patientCode}
                placeholder={t("auth.register.patientCodePlaceholder")}
                icon="key"
                required
              />
            </>
          ) : (
            <>
              <FormField
                id="dateOfBirth"
                type="date"
                label={t("auth.register.dobLabel")}
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.dateOfBirth}
                touched={touchedFields.dateOfBirth}
                icon="calendar_today"
                required
              />

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <FormField
                  id="gender"
                  type="select"
                  label={t("auth.register.genderLabel")}
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  touched={touchedFields.gender}
                  icon="wc"
                >
                  <option value="male">{t("auth.register.male")}</option>
                  <option value="female">{t("auth.register.female")}</option>
                  <option value="other">{t("auth.register.otherGender") || t("auth.register.other")}</option>
                </FormField>

                <FormField
                  id="bloodType"
                  type="select"
                  label={t("auth.register.bloodTypeLabel")}
                  value={formData.bloodType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  touched={touchedFields.bloodType}
                  icon="bloodtype"
                >
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </FormField>
              </div>
            </>
          )}
        </>
      )}

      {/* ================= STEP 3 ================= */}
      {currentStep === 3 && (
        <>
          {formData.role === "patient" ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <FormField
                  id="height"
                  type="number"
                  label={t("auth.register.heightLabel")}
                  value={formData.height}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.height}
                  touched={touchedFields.height}
                  placeholder="cm"
                  icon="height"
                />
                <FormField
                  id="weight"
                  type="number"
                  label={t("auth.register.weightLabel")}
                  value={formData.weight}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.weight}
                  touched={touchedFields.weight}
                  placeholder="kg"
                  icon="scale"
                />
              </div>

              <FormField
                id="allergies"
                label={t("auth.register.allergiesLabel")}
                value={formData.allergies}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.allergies}
                touched={touchedFields.allergies}
                placeholder={t("auth.register.allergiesPlaceholder")}
                icon="warning"
              />

              <FormField
                id="emergencyContactName"
                label={t("auth.register.emergencyContactNameLabel")}
                value={formData.emergencyContactName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.emergencyContactName}
                touched={touchedFields.emergencyContactName}
                placeholder={t("auth.register.emergencyContactNamePlaceholder")}
                icon="person"
                required
              />

              <PhoneInput
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.emergencyContactPhone}
                touched={touchedFields.emergencyContactPhone}
                isPhoneInput={true}
                countrySelectorProps={countrySelectorProps}
                label={t("auth.register.emergencyContactPhoneLabel")}
                placeholder={t("auth.register.emergencyContactPhonePlaceholder")}
                required
              />
            </>
          ) : (
            <div className="space-y-4 bg-surface-container-low p-4 rounded-[16px] border border-outline-variant/40">
              <span className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface">
                {t("auth.register.caregiverAlertsTitle") || "إعدادات التنبيهات"}
              </span>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-on-surface">
                  {t("auth.register.alertInstantMissed") || "تنبيهات فورية للجرعات الفائتة"}
                </span>
                <input
                  id="alertSettings.instantMissed"
                  type="checkbox"
                  checked={formData.alertSettings?.instantMissed}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/40"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-on-surface">
                  {t("auth.register.alertWeeklyReport") || "تقرير أسبوعي عن الالتزام"}
                </span>
                <input
                  id="alertSettings.weeklyReport"
                  type="checkbox"
                  checked={formData.alertSettings?.weeklyReport}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/40"
                />
              </label>
            </div>
          )}

          {/* WhatsApp Opt-in */}
          <div className="pt-2">
            <label className="flex items-center justify-between cursor-pointer p-4 bg-surface-container-low rounded-[16px] border border-outline-variant/40 hover:border-primary/40 transition-colors shadow-xs">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-success text-[24px]">chat</span>
                <span className="text-sm md:text-base font-semibold text-on-surface">
                  {t("auth.register.whatsappOptInLabel") || "تفعيل إشعارات الواتساب"}
                </span>
              </div>
              <input
                id="whatsappOptIn"
                type="checkbox"
                checked={formData.whatsappOptIn}
                onChange={handleChange}
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/40 cursor-pointer"
              />
            </label>
          </div>
        </>
      )}
    </>
  );
}
