/**
 * parseApiMessage - Extracts the correct language message from an API error/message string.
 *
 * The API returns errors serialized as JSON strings with shape:
 *   '{"en": "...", "ar": "..."}'
 *
 * This helper attempts to parse and extract the locale-specific message,
 * falling back gracefully to en → original string.
 *
 * @param {string|null} rawError - The error string from Redux state
 * @param {string} locale - Current locale ("en" | "ar")
 * @param {Function} t - Translation function for known error codes
 * @returns {string|null}
 */
export function parseApiMessage(rawError, locale, t) {
  if (!rawError) return null;

  try {
    const parsed = JSON.parse(rawError);
    // Handle { en: "...", ar: "..." } shape (standard API messages)
    if (parsed && typeof parsed === 'object') {
      return parsed[locale] || parsed['en'] || rawError;
    }
  } catch {
    // Not JSON — might be a known error code key
    if (t) {
      const transKey = `auth.error.${rawError}`;
      const translated = t(transKey);
      if (translated !== transKey) return translated;
    }
  }

  return rawError;
}
