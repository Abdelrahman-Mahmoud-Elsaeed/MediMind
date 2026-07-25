import { parsePhoneNumberFromString } from "libphonenumber-js";

function isValidPhoneForCountry(phoneStr, countryCode = "EG") {
  if (!phoneStr) return false;
  let normalized = phoneStr.trim();
  if (normalized.startsWith("00")) {
    normalized = `+${normalized.slice(2)}`;
  }
  try {
    const parsed = normalized.startsWith("+")
      ? parsePhoneNumberFromString(normalized)
      : parsePhoneNumberFromString(normalized, countryCode);
    
    if (!parsed) return false;
    
    // If phone starts with '+' but country doesn't match selected, it's invalid for the selected country
    if (normalized.startsWith("+") && parsed.country !== countryCode) {
      return false;
    }
    
    // Enforce mobile-only for Egypt (EG)
    if (parsed.country === "EG" || countryCode === "EG") {
      const isEgMobile = parsed.nationalNumber.startsWith("1") && parsed.nationalNumber.length === 10;
      if (!isEgMobile) {
        return false;
      }
    }
    
    return parsed.isValid();
  } catch (err) {
    return false;
  }
}

export function validateStep1(formData, t, countryCode = "EG") {
  const errors = {};
  let valid = true;

  const loginVal = formData.loginInput ? formData.loginInput.trim() : "";

  if (!loginVal) {
    errors.loginInput = t("auth.validation.emailOrPhoneRequired") || "Email or phone number is required";
    valid = false;
  } else {
    const isPhone = /^[0-9+\s()-]+$/.test(loginVal);
    if (isPhone) {
      if (!isValidPhoneForCountry(loginVal, countryCode)) {
        errors.loginInput = t("auth.validation.invalidPhoneForCountry") || "Please enter a valid phone number for the selected country.";
        valid = false;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginVal)) {
        errors.loginInput = t("auth.validation.invalidEmail") || "Invalid email format";
        valid = false;
      }
    }
  }

  const pwd = formData.password || "";
  if (!pwd) {
    errors.password = t("auth.validation.passwordRequired") || "Password is required";
    valid = false;
  } else if (pwd.length < 8) {
    errors.password = t("auth.validation.passwordMin") || "Password must be at least 8 characters long";
    valid = false;
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
    errors.password =
      t("auth.validation.passwordRequirements") ||
      "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    valid = false;
  }

  return { valid, errors };
}

export function validateStep2(formData, isPhoneInput, t, countryCode = "EG") {
  const errors = {};
  let valid = true;

  const firstName = formData.firstName ? formData.firstName.trim() : "";
  if (!firstName) {
    errors.firstName = t("auth.validation.firstNameRequired") || "First name is required";
    valid = false;
  } else if (firstName.length < 2) {
    errors.firstName = t("auth.validation.firstNameMin") || "First name must be at least 2 characters";
    valid = false;
  } else if (firstName.length > 50) {
    errors.firstName = t("auth.validation.firstNameMax") || "First name must be at most 50 characters";
    valid = false;
  }

  const lastName = formData.lastName ? formData.lastName.trim() : "";
  if (!lastName) {
    errors.lastName = t("auth.validation.lastNameRequired") || "Last name is required";
    valid = false;
  } else if (lastName.length < 2) {
    errors.lastName = t("auth.validation.lastNameMin") || "Last name must be at least 2 characters";
    valid = false;
  } else if (lastName.length > 50) {
    errors.lastName = t("auth.validation.lastNameMax") || "Last name must be at most 50 characters";
    valid = false;
  }

  if (isPhoneInput) {
    const emailVal = formData.email ? formData.email.trim() : "";
    if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      errors.email = t("auth.validation.invalidEmail") || "Invalid email format";
      valid = false;
    }
  } else {
    const phoneVal = formData.phone ? formData.phone.trim() : "";
    if (phoneVal) {
      if (!isValidPhoneForCountry(phoneVal, countryCode)) {
        errors.phone = t("auth.validation.invalidPhoneForCountry") || "Please enter a valid phone number for the selected country.";
        valid = false;
      }
    }
  }

  if (formData.role !== "caregiver") {
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = t("auth.validation.dobRequired") || "Date of birth is required";
      valid = false;
    }
  }

  return { valid, errors };
}

export function validateStep3(formData, t, countryCode = "EG") {
  const errors = {};
  let valid = true;

  if (formData.role === "patient") {
    const emName = formData.emergencyContactName ? formData.emergencyContactName.trim() : "";
    if (!emName) {
      errors.emergencyContactName = t("auth.validation.contactNameRequired") || "Emergency contact name is required";
      valid = false;
    }

    const emPhoneVal = formData.emergencyContactPhone ? formData.emergencyContactPhone.trim() : "";
    if (!emPhoneVal) {
      errors.emergencyContactPhone = t("auth.validation.contactPhoneRequired") || "Emergency contact phone is required";
      valid = false;
    } else {
      if (!isValidPhoneForCountry(emPhoneVal, countryCode)) {
        errors.emergencyContactPhone = t("auth.validation.invalidPhoneForCountry") || "Please enter a valid phone number for the selected country.";
        valid = false;
      }
    }
  }

  return { valid, errors };
}

export function validateStep(step, formData, isPhoneInput, t, countryCode = "EG") {
  if (step === 1) return validateStep1(formData, t, countryCode);
  if (step === 2) return validateStep2(formData, isPhoneInput, t, countryCode);
  if (step === 3) return validateStep3(formData, t, countryCode);
  return { valid: true, errors: {} };
}
