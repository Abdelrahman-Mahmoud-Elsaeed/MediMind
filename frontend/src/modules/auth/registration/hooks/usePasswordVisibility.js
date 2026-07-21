import { useState, useCallback } from "react";

export function usePasswordVisibility(initialState = false) {
  const [showPassword, setShowPassword] = useState(initialState);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    showPassword,
    setShowPassword,
    togglePasswordVisibility,
  };
}
