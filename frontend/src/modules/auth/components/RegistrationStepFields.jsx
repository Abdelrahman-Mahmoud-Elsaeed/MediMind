'use client';

import React from "react";
import { getCountryCallingCode } from "react-phone-number-input/input";
import flags from "react-phone-number-input/flags";

const CAREGIVER_RELATIONS = [
  "son",
  "daughter",
  "spouse",
  "parent",
  "sibling",
  "friend",
  "other",
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegistrationStepFields({
  currentStep,
  formData,
  setFormData,
  handleChange,
  errors,
  showPassword,
  setShowPassword,
  isPhoneInput,
  country,
  setCountry,
  countries,
  isDropdownOpen,
  setIsDropdownOpen,
  openDropdown,
  highlightedIndex,
  setHighlightedIndex,
  dropdownRef,
  listRef,
  triggerRef,
  handleDropdownKeyDown,
  isRtl,
  t,
}) {
  const SelectedFlag = flags[country];

  return (
    <>
      {/* ================= الخطوة 1: بيانات الاعتماد والدور ================= */}
      {currentStep === 1 && (
        <>
          <div>
            <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="loginInput">
              {t("auth.register.emailOrPhoneLabel")}
            </label>
            <div className="relative flex items-center">
              <span
                className={`material-symbols-outlined absolute ${
                  isRtl ? "right-4" : "left-4"
                } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10 text-[22px]`}
              >
                {isPhoneInput ? "call" : "mail"}
              </span>

              <input
                id="loginInput"
                type="text"
                required
                value={formData.loginInput}
                onChange={handleChange}
                placeholder={t("auth.register.emailOrPhonePlaceholder")}
                dir={isPhoneInput ? "ltr" : isRtl ? "rtl" : "ltr"}
                className={`w-full h-[58px] font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-outline-variant/80 transition-all rounded-[16px] bg-surface-container-lowest shadow-sm ${
                  isPhoneInput
                    ? isRtl
                      ? "pr-[48px] pl-[145px]"
                      : "pl-[48px] pr-[145px]"
                    : isRtl
                      ? "pr-[48px] pl-4"
                      : "pl-[48px] pr-4"
                }`}
              />

              {/* القائمة المنسدلة لاختيار الدولة */}
              {isPhoneInput && (
                <div
                  ref={dropdownRef}
                  className={`absolute ${
                    isRtl ? "left-2 border-r pl-1" : "right-2 border-l pr-1"
                  } top-1/2 -translate-y-1/2 border-outline-variant/40 px-2 flex items-center z-20 bg-surface-container-lowest h-[40px]`}
                >
                  <button
                    ref={triggerRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    onClick={() => (isDropdownOpen ? setIsDropdownOpen(false) : openDropdown())}
                    onKeyDown={handleDropdownKeyDown}
                    className="flex items-center gap-1.5 font-['Inter'] text-sm md:text-base font-semibold text-on-surface cursor-pointer py-1 px-1 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
                    dir="ltr"
                  >
                    {SelectedFlag && (
                      <span className="w-5 h-3.5 overflow-hidden rounded-sm flex-shrink-0 inline-block shadow-xs">
                        <SelectedFlag title={country} />
                      </span>
                    )}
                    <span>+{getCountryCallingCode(country)}</span>
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      {isDropdownOpen ? "arrow_drop_up" : "arrow_drop_down"}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <ul
                      ref={listRef}
                      role="listbox"
                      tabIndex={0}
                      onKeyDown={handleDropdownKeyDown}
                      className={`absolute ${isRtl ? "left-0" : "right-0"} top-[46px] w-48 max-h-56 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-[12px] shadow-lg z-50 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30`}
                      dir="ltr"
                    >
                      {countries.map((c, index) => {
                        const CountryFlag = flags[c];
                        const isHighlighted = highlightedIndex === index;
                        const isSelected = country === c;

                        return (
                          <li
                            key={c}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setCountry(c);
                              setIsDropdownOpen(false);
                              triggerRef.current?.focus();
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
                              isHighlighted || isSelected
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-on-surface"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {CountryFlag && (
                                <span className="w-5 h-3.5 overflow-hidden rounded-sm flex-shrink-0 inline-block shadow-xs">
                                  <CountryFlag title={c} />
                                </span>
                              )}
                              <span>{c}</span>
                            </div>
                            <span className="text-on-surface-variant text-xs">
                              +{getCountryCallingCode(c)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {errors.loginInput && (
              <p className="text-error text-sm font-medium mt-1.5 text-start">{errors.loginInput}</p>
            )}
          </div>

          <div>
            <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="password">
              {t("auth.register.passwordLabel")}
            </label>
            <div className="relative">
              <span className={`material-symbols-outlined absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[22px]`}>
                lock
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t("auth.register.passwordPlaceholder")}
                dir="ltr"
                className={`w-full h-[58px] ${isRtl ? "pr-[48px] pl-[48px]" : "pl-[48px] pr-[48px]"} font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-outline-variant/80 transition-all rounded-[16px] bg-surface-container-lowest shadow-sm`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`absolute ${isRtl ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-error text-sm font-medium mt-1.5 text-start">{errors.password}</p>
            )}
          </div>

          {/* تبديل الدور (مريض / مقدم رعاية) */}
          <div className="pt-2">
            <span className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-3">
              {t("auth.register.roleTitle")}
            </span>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: "patient" }))}
                className={`relative rounded-[16px] p-5 flex flex-col items-center gap-2 border-2 text-center transition-all cursor-pointer shadow-sm ${
                  formData.role === "patient"
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">person</span>
                <span className="font-['Inter'] text-sm md:text-base font-semibold">
                  {t("auth.register.patientRole")}
                </span>
                {formData.role === "patient" && (
                  <div className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: "caregiver" }))}
                className={`relative rounded-[16px] p-5 flex flex-col items-center gap-2 border-2 text-center transition-all cursor-pointer shadow-sm ${
                  formData.role === "caregiver"
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">favorite</span>
                <span className="font-['Inter'] text-sm md:text-base font-semibold">
                  {t("auth.register.caregiverRole")}
                </span>
                {formData.role === "caregiver" && (
                  <div className={`absolute top-3 ${isRtl ? "left-3" : "right-3"} w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= الخطوة 2: الملف الشخصي والبيانات الديموغرافية ================= */}
      {currentStep === 2 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="firstName">
                {t("auth.register.firstNameLabel")} <span className="text-error">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder={t("auth.register.firstNamePlaceholder")}
                className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
              />
              {errors.firstName && <p className="text-error text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="lastName">
                {t("auth.register.lastNameLabel")} <span className="text-error">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder={t("auth.register.lastNamePlaceholder")}
                className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
              />
              {errors.lastName && <p className="text-error text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* حقل الهاتف الثانوي */}
          {formData.loginInput && !isPhoneInput && (
            <div>
              <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="phone">
                {t("auth.register.phoneLabel")} <span className="text-xs text-on-surface-variant font-normal">(اختياري)</span>
              </label>
              <div className="relative flex items-center">
                <span
                  className={`material-symbols-outlined absolute ${
                    isRtl ? "right-4" : "left-4"
                  } top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none z-10 text-[22px]`}
                >
                  call
                </span>

                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("auth.register.phonePlaceholder")}
                  dir="ltr"
                  className={`w-full h-[58px] font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-outline-variant/80 transition-all rounded-[16px] bg-surface-container-lowest shadow-sm ${
                    isRtl ? "pr-[48px] pl-[145px]" : "pl-[48px] pr-[145px]"
                  }`}
                />

                {/* القائمة المنسدلة لاختيار الدولة */}
                <div
                  ref={dropdownRef}
                  className={`absolute ${
                    isRtl ? "left-2 border-r pl-1" : "right-2 border-l pr-1"
                  } top-1/2 -translate-y-1/2 border-outline-variant/40 px-2 flex items-center z-20 bg-surface-container-lowest h-[40px]`}
                >
                  <button
                    ref={triggerRef}
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    onClick={() => (isDropdownOpen ? setIsDropdownOpen(false) : openDropdown())}
                    onKeyDown={handleDropdownKeyDown}
                    className="flex items-center gap-1.5 font-['Inter'] text-sm md:text-base font-semibold text-on-surface cursor-pointer py-1 px-1 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
                    dir="ltr"
                  >
                    {SelectedFlag && (
                      <span className="w-5 h-3.5 overflow-hidden rounded-sm flex-shrink-0 inline-block shadow-xs">
                        <SelectedFlag title={country} />
                      </span>
                    )}
                    <span>+{getCountryCallingCode(country)}</span>
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      {isDropdownOpen ? "arrow_drop_up" : "arrow_drop_down"}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <ul
                      ref={listRef}
                      role="listbox"
                      tabIndex={0}
                      onKeyDown={handleDropdownKeyDown}
                      className={`absolute ${isRtl ? "left-0" : "right-0"} top-[46px] w-48 max-h-56 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-[12px] shadow-lg z-50 py-1 focus:outline-none focus:ring-1 focus:ring-primary/30`}
                      dir="ltr"
                    >
                      {countries.map((c, index) => {
                        const CountryFlag = flags[c];
                        const isHighlighted = highlightedIndex === index;
                        const isSelected = country === c;

                        return (
                          <li
                            key={c}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setCountry(c);
                              setIsDropdownOpen(false);
                              triggerRef.current?.focus();
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium cursor-pointer transition-colors ${
                              isHighlighted || isSelected
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-on-surface"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {CountryFlag && (
                                <span className="w-5 h-3.5 overflow-hidden rounded-sm flex-shrink-0 inline-block shadow-xs">
                                  <CountryFlag title={c} />
                                </span>
                              )}
                              <span>{c}</span>
                            </div>
                            <span className="text-on-surface-variant text-xs">
                              +{getCountryCallingCode(c)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
              {errors.phone && <p className="text-error text-sm mt-1">{errors.phone}</p>}
            </div>
          )}

          {/* حقل البريد الإلكتروني الثانوي */}
          {formData.loginInput && isPhoneInput && (
            <div>
              <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="email">
                {t("auth.register.emailLabel")} <span className="text-xs text-on-surface-variant font-normal">(اختياري)</span>
              </label>
              <div className="relative">
                <span className={`material-symbols-outlined absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[22px]`}>
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("auth.register.emailPlaceholder")}
                  dir="ltr"
                  className={`w-full h-[58px] ${isRtl ? "pr-[48px] pl-4" : "pl-[48px] pr-4"} font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm`}
                />
              </div>
              {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
            </div>
          )}

          {/* التفريعات المعتمدة على الدور الديناميكي */}
          {formData.role === "caregiver" ? (
            <>
              <div>
                <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="relation">
                  {t("auth.register.relationLabel")} <span className="text-error">*</span>
                </label>
                <select
                  id="relation"
                  value={formData.relation}
                  onChange={handleChange}
                  className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm capitalize cursor-pointer"
                >
                  <option value="" disabled>
                    {t("auth.register.relationSelect")}
                  </option>
                  {CAREGIVER_RELATIONS.map((rel) => (
                    <option key={rel} value={rel}>
                      {t(`auth.register.relation_${rel}`)}
                    </option>
                  ))}
                </select>
                {errors.relation && <p className="text-error text-sm mt-1">{errors.relation}</p>}
              </div>

              <div>
                <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="patientCode">
                  {t("auth.register.patientCodeLabel")} <span className="text-error">*</span>
                </label>
                <input
                  id="patientCode"
                  type="text"
                  required
                  value={formData.patientCode}
                  onChange={handleChange}
                  placeholder={t("auth.register.patientCodePlaceholder")}
                  className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
                />
                {errors.patientCode && <p className="text-error text-sm mt-1">{errors.patientCode}</p>}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="dateOfBirth">
                  {t("auth.register.dobLabel")} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className={`material-symbols-outlined absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[22px]`}>
                    calendar_today
                  </span>
                  <input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full h-[58px] ${isRtl ? "pr-[48px] pl-4" : "pl-[48px] pr-4"} font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm cursor-pointer`}
                  />
                </div>
                {errors.dateOfBirth && <p className="text-error text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="gender">
                    {t("auth.register.genderLabel")}
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm cursor-pointer capitalize"
                  >
                    <option value="male">{t("auth.register.male")}</option>
                    <option value="female">{t("auth.register.female")}</option>
                    <option value="other">{t("auth.register.otherGender")}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="bloodType">
                    {t("auth.register.bloodTypeLabel")}
                  </label>
                  <select
                    id="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm cursor-pointer"
                  >
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ================= الخطوة 3: الملف الطبي / إعدادات مقدم الرعاية ================= */}
      {currentStep === 3 && (
        <>
          {formData.role === "patient" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="height">
                    {t("auth.register.heightLabel")}
                  </label>
                  <input
                    id="height"
                    type="number"
                    placeholder={t("auth.register.heightPlaceholder")}
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="weight">
                    {t("auth.register.weightLabel")}
                  </label>
                  <input
                    id="weight"
                    type="number"
                    placeholder={t("auth.register.weightPlaceholder")}
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="allergies">
                  {t("auth.register.allergiesLabel")}
                </label>
                <input
                  id="allergies"
                  type="text"
                  placeholder={t("auth.register.allergiesPlaceholder")}
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
                />
              </div>

              <div>
                <label className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2" htmlFor="medicalHistory">
                  {t("auth.register.medicalHistoryLabel")}
                </label>
                <textarea
                  id="medicalHistory"
                  rows={3}
                  placeholder={t("auth.register.medicalHistoryPlaceholder")}
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  className="w-full p-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm resize-none"
                />
              </div>

              {/* مجموعة جهات اتصال الطوارئ */}
              <div className="space-y-4 pt-2">
                <span className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface">
                  {t("auth.register.emergencyContactSection")} <span className="text-error">*</span>
                </span>
                
                <div>
                  <input
                    id="emergencyContactName"
                    type="text"
                    required
                    placeholder={t("auth.register.emNamePlaceholder")}
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
                  />
                  {errors.emergencyContactName && (
                    <p className="text-error text-sm mt-1">{errors.emergencyContactName}</p>
                  )}
                </div>

                <div>
                  <input
                    id="emergencyContactPhone"
                    type="tel"
                    required
                    placeholder={t("auth.register.emPhonePlaceholder")}
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    dir="ltr"
                    className="w-full h-[58px] px-4 font-['Inter'] text-base md:text-lg text-on-surface border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none rounded-[16px] bg-surface-container-lowest shadow-sm"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-error text-sm mt-1">{errors.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* تفضيلات تنبيهات مقدم الرعاية */
            <div className="space-y-4">
              <span className="block font-['Inter'] text-sm md:text-base font-semibold text-on-surface mb-2">
                {t("auth.register.notificationPreferencesTitle")}
              </span>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  id="alertSettings.instantMissed"
                  type="checkbox"
                  checked={formData.alertSettings.instantMissed}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-on-surface">
                  {t("auth.register.instantMissedAlerts")}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  id="alertSettings.weeklyReport"
                  type="checkbox"
                  checked={formData.alertSettings.weeklyReport}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-on-surface">
                  {t("auth.register.weeklyReportAlerts")}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  id="alertSettings.monthlyReport"
                  type="checkbox"
                  checked={formData.alertSettings.monthlyReport}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-on-surface">
                  {t("auth.register.monthlyReportAlerts")}
                </span>
              </label>
            </div>
          )}

          {/* الاشتراك في تنبيهات واتساب */}
          <div className="pt-4 border-t border-outline-variant/40">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                id="whatsappOptIn"
                type="checkbox"
                checked={formData.whatsappOptIn}
                onChange={handleChange}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-on-surface">
                {t("auth.register.whatsappOptInLabel")}
              </span>
            </label>
          </div>
        </>
      )}
    </>
  );
}