import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { getCountries, getCountryCallingCode, flags, DEFAULT_COUNTRY } from "../constants/countries";

export function useCountrySelector(phoneValue = "") {
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const dropdownRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);
  const typeaheadRef = useRef("");
  const typeaheadTimeoutRef = useRef(null);

  const countries = useMemo(() => getCountries(), []);

  // Auto detect country code from typed phone
  useEffect(() => {
    if (!phoneValue) return;
    const cleanDigits = phoneValue.replace(/\D/g, "");
    if (!cleanDigits) return;

    const sortedCountries = [...countries].sort(
      (a, b) => getCountryCallingCode(b).length - getCountryCallingCode(a).length
    );

    const matchedCountry = sortedCountries.find((c) =>
      cleanDigits.startsWith(getCountryCallingCode(c))
    );

    if (matchedCountry && matchedCountry !== country) {
      setCountry(matchedCountry);
    }
  }, [phoneValue, country, countries]);

  const openDropdown = useCallback(() => {
    const selectedIdx = countries.findIndex((c) => c === country);
    setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    setIsDropdownOpen(true);
  }, [countries, country]);

  // Scroll active item into view
  useEffect(() => {
    if (isDropdownOpen && listRef.current) {
      const activeOption = listRef.current.children[highlightedIndex];
      activeOption?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isDropdownOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownKeyDown = useCallback(
    (e) => {
      if (!isDropdownOpen) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const keyLower = e.key.toLowerCase();
        if (typeaheadTimeoutRef.current) clearTimeout(typeaheadTimeoutRef.current);

        const isRepeatedChar =
          typeaheadRef.current.length === 1 && typeaheadRef.current === keyLower;

        if (isRepeatedChar) {
          const nextIndex = countries.findIndex(
            (c, idx) => idx > highlightedIndex && c.toLowerCase().startsWith(keyLower)
          );
          if (nextIndex !== -1) setHighlightedIndex(nextIndex);
          else {
            const firstIdx = countries.findIndex((c) => c.toLowerCase().startsWith(keyLower));
            if (firstIdx !== -1) setHighlightedIndex(firstIdx);
          }
        } else {
          typeaheadRef.current += keyLower;
          const matchIdx = countries.findIndex((c) =>
            c.toLowerCase().startsWith(typeaheadRef.current)
          );
          if (matchIdx !== -1) setHighlightedIndex(matchIdx);
        }

        typeaheadTimeoutRef.current = setTimeout(() => {
          typeaheadRef.current = "";
        }, 500);
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % countries.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + countries.length) % countries.length);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          setCountry(countries[highlightedIndex]);
          setIsDropdownOpen(false);
          triggerRef.current?.focus();
          break;
        case "Escape":
        case "Tab":
          setIsDropdownOpen(false);
          triggerRef.current?.focus();
          break;
        default:
          break;
      }
    },
    [isDropdownOpen, openDropdown, countries, highlightedIndex]
  );

  const SelectedFlag = flags[country];
  const callingCode = getCountryCallingCode(country);

  return {
    country,
    setCountry,
    isDropdownOpen,
    setIsDropdownOpen,
    openDropdown,
    highlightedIndex,
    setHighlightedIndex,
    dropdownRef,
    listRef,
    triggerRef,
    handleDropdownKeyDown,
    countries,
    callingCode,
    SelectedFlag,
  };
}
