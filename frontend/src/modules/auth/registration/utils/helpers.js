/**
 * Helper utilities for input detection and payload formatting according to apiSpecificationDesign.md & backend validators.
 */

export function detectPhoneInput(value) {
  if (!value) return false;
  return /^[0-9+\s()-]+$/.test(value.trim());
}

export function extractNationalNumber(phoneValue, defaultCallingCode = "20") {
  if (!phoneValue) return null;
  const cleanCode = String(defaultCallingCode).replace(/\D/g, "") || "20";
  let digits = phoneValue.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith(cleanCode)) {
    digits = digits.slice(cleanCode.length);
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length >= 7 && digits.length <= 14) {
    return {
      code: `+${cleanCode}`,
      number: digits,
    };
  }

  return null;
}

export function formatRegistrationPayload(formData, registrationData, isPhoneInput, locale, callingCode = "20") {
  const isPhoneReg = isPhoneInput || (formData.loginInput && /^[0-9+\s()-]+$/.test(formData.loginInput.trim()));

  const role = formData.role === "caregiver" ? "FAMILY_CAREGIVER" : "PATIENT";

  const credentials = {
    password: formData.password,
  };

  let activePhone = "";
  if (isPhoneReg) {
    activePhone = formData.loginInput ? formData.loginInput.trim() : formData.phone;
    const nationalNum = extractNationalNumber(activePhone, callingCode);
    credentials.phone = nationalNum ? `${nationalNum.code}${nationalNum.number}` : activePhone;
  } else {
    credentials.email = formData.loginInput ? formData.loginInput.trim() : formData.email;
    if (formData.phone && formData.phone.trim()) {
      activePhone = formData.phone.trim();
    }
  }

  const nationalNum = extractNationalNumber(activePhone, callingCode);

  const basePayload = {
    ...registrationData,
    role,
    credentials,
  };

  if (activePhone) {
    basePayload.phone = nationalNum ? `${nationalNum.code}${nationalNum.number}` : activePhone;
  }

  if (nationalNum) {
    basePayload.nationalNumber = nationalNum;
  }

  if (role === "FAMILY_CAREGIVER") {
    return {
      ...basePayload,
      firstName: formData.firstName ? formData.firstName.trim() : "",
      lastName: formData.lastName ? formData.lastName.trim() : "",
      relation: formData.relation || "other",
      patientCode: formData.patientCode ? formData.patientCode.trim() : "",
      whatsappOptIn: Boolean(formData.whatsappOptIn),
      preferredLanguage: locale || "ar",
      alertSettings: formData.alertSettings || {},
    };
  }

  const allergiesArray = formData.allergies
    ? formData.allergies.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const payload = {
    ...basePayload,
    firstName: formData.firstName ? formData.firstName.trim() : "",
    lastName: formData.lastName ? formData.lastName.trim() : "",
    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
    gender: formData.gender || "male",
    bloodType: formData.bloodType || "A+",
    whatsappOptIn: Boolean(formData.whatsappOptIn),
    preferredLanguage: locale || "ar",
  };

  if (formData.height) payload.height = Number(formData.height);
  if (formData.weight) payload.weight = Number(formData.weight);
  if (allergiesArray.length > 0) payload.allergies = allergiesArray;
  if (formData.medicalHistory) payload.medicalHistory = formData.medicalHistory;

  if (formData.emergencyContactName || formData.emergencyContactPhone) {
    payload.emergencyContact = [
      {
        name: formData.emergencyContactName ? formData.emergencyContactName.trim() : "",
        phone: formData.emergencyContactPhone ? formData.emergencyContactPhone.trim() : "",
      },
    ];
  }

  return payload;
}
