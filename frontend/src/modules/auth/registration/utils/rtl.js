/**
 * Utility functions for handling RTL/LTR layout calculations and class generation.
 */

export function getRTLClass(isRtl, ltrClass, rtlClass) {
  return isRtl ? rtlClass : ltrClass;
}

export function getIconPositionClass(isRtl, side = "start") {
  if (side === "start") {
    return isRtl ? "right-4" : "left-4";
  }
  return isRtl ? "left-4" : "right-4";
}

export function getInputPaddingClass(isRtl, { hasStartIcon = true, hasEndAction = false }) {
  if (hasEndAction) {
    return isRtl
      ? "pr-[48px] pl-[145px]"
      : "pl-[48px] pr-[145px]";
  }
  if (hasStartIcon) {
    return isRtl
      ? "pr-[48px] pl-4"
      : "pl-[48px] pr-4";
  }
  return "px-4";
}

export function getDropdownPositionClass(isRtl) {
  return isRtl ? "left-2 border-r pl-1" : "right-2 border-l pr-1";
}

export function getDropdownListPositionClass(isRtl) {
  return isRtl ? "left-0" : "right-0";
}

export function getBadgePositionClass(isRtl) {
  return isRtl ? "left-3" : "right-3";
}

export function getArrowIconClass(isRtl, type = "forward") {
  if (type === "back") {
    return "material-symbols-outlined text-[20px] rtl:rotate-180";
  }
  return `material-symbols-outlined text-[20px] transition-transform ${
    isRtl ? "-rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
  }`;
}

export function getProgressBarStyle(isRtl, currentStep) {
  const widthMap = { 1: "0%", 2: "50%", 3: "100%" };
  const width = widthMap[currentStep] || "0%";
  return {
    width,
    [isRtl ? "right" : "left"]: "3rem",
  };
}
