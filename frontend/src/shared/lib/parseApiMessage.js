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
export function parseApiMessage(rawError, locale = 'en', t) {
  if (!rawError) return null;

  let extractedMsg = null;

  if (typeof rawError === 'object') {
    const data = rawError.response?.data || rawError.data || rawError;
    if (data && typeof data === 'object') {
      if (data.messages) {
        extractedMsg = data.messages[locale] || data.messages['en'] || data.messages;
      } else if (data.error?.messages) {
        extractedMsg = data.error.messages[locale] || data.error.messages['en'];
      } else if (data.message) {
        extractedMsg = data.message;
      }
    }
    if (!extractedMsg && rawError.message) {
      return parseApiMessage(rawError.message, locale, t);
    }
  } else if (typeof rawError === 'string') {
    extractedMsg = rawError;
    try {
      const parsed = JSON.parse(rawError);
      if (parsed && typeof parsed === 'object') {
        extractedMsg = parsed[locale] || parsed['en'] || parsed.message || rawError;
      }
    } catch {
      // Not JSON — use rawError
    }
  }

  if (typeof extractedMsg === 'object' && extractedMsg !== null) {
    extractedMsg = extractedMsg[locale] || extractedMsg['en'] || JSON.stringify(extractedMsg);
  }

  return cleanErrorMessage(extractedMsg || String(rawError), locale, t);
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
