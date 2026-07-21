import React from "react";
import { useRTL } from "../hooks/useRTL";

export function CountrySelector({
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
  callingCode,
  SelectedFlag,
  getCountryCallingCode,
  flags,
}) {
  const { isRtl } = useRTL();

  return (
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
        <span>+{callingCode}</span>
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
  );
}
