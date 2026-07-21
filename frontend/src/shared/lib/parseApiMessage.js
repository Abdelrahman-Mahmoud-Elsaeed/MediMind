/**
 * parseApiMessage - Cleanly formats and extracts user-friendly localized error messages from API responses.
 *
 * Handles serialized JSON envelopes ({ en: "...", ar: "..." }) as well as raw strings like:
 *   "Validation failed: credentials.password: Password must contain at least one uppercase letter, one lowercase letter, and one number"
 *
 * @param {string|null} rawError - The error string from Redux state or API response
 * @param {string} locale - Current locale ("en" | "ar")
 * @param {Function} t - Translation function
 * @returns {string|null}
 */
export function parseApiMessage(rawError, locale, t) {
  if (!rawError) return null;

  let extractedMsg = rawError;

  try {
    const parsed = JSON.parse(rawError);
    if (parsed && typeof parsed === 'object') {
      extractedMsg = parsed[locale] || parsed['en'] || rawError;
    }
  } catch {
    // Not JSON — use rawError
  }

  return cleanErrorMessage(extractedMsg, locale, t);
}

function cleanErrorMessage(msg, locale, t) {
  if (typeof msg !== 'string') return msg;

  // Strip technical validation prefixes like "Validation failed: credentials.password: "
  let cleaned = msg
    .replace(/^Validation failed:\s*/i, '')
    .replace(/^(credentials|user)\.[a-zA-Z0-9_-]+:\s*/i, '')
    .replace(/^[a-zA-Z0-9_.-]+:\s*/i, '')
    .trim();

  // Known validation message translations
  if (cleaned.includes("uppercase letter, one lowercase letter, and one number")) {
    return locale === "ar"
      ? "يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم واحد على الأقل."
      : "Password must contain at least one uppercase letter, one lowercase letter, and one number.";
  }

  if (cleaned.includes("at least 8 characters") || cleaned.includes("at least 6 characters")) {
    return locale === "ar"
      ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."
      : "Password must be at least 8 characters.";
  }

  if (t) {
    const transKey = `auth.error.${cleaned}`;
    const translated = t(transKey);
    if (translated !== transKey) return translated;
  }

  return cleaned;
}
