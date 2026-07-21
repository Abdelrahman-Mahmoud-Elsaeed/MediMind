import { useTranslation } from "@/shared/lib/i18nContext";
import {
  getRTLClass,
  getIconPositionClass,
  getInputPaddingClass,
  getDropdownPositionClass,
  getDropdownListPositionClass,
  getBadgePositionClass,
  getArrowIconClass,
  getProgressBarStyle,
} from "../utils/rtl";

export function useRTL() {
  const translation = useTranslation();
  const { dir, locale, t } = translation;

  // Correctly compute isRtl based on locale or dir
  const isRtl = locale === "ar" || dir === "rtl";

  return {
    ...translation,
    isRtl,
    dir: isRtl ? "rtl" : "ltr",
    locale,
    t,
    getRTLClass: (ltrClass, rtlClass) => getRTLClass(isRtl, ltrClass, rtlClass),
    getIconPositionClass: (side) => getIconPositionClass(isRtl, side),
    getInputPaddingClass: (opts) => getInputPaddingClass(isRtl, opts),
    getDropdownPositionClass: () => getDropdownPositionClass(isRtl),
    getDropdownListPositionClass: () => getDropdownListPositionClass(isRtl),
    getBadgePositionClass: () => getBadgePositionClass(isRtl),
    getArrowIconClass: (type) => getArrowIconClass(isRtl, type),
    getProgressBarStyle: (step) => getProgressBarStyle(isRtl, step),
  };
}
