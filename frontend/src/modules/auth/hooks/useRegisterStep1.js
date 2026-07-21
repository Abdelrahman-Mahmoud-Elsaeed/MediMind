import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "./useAuth";
import { getStep1Schema } from "../validation/authValidation";
import { getCountryCallingCode } from "react-phone-number-input/input";

export const useRegisterStep1 = () => {
  const router = useRouter();
  const { setRegistrationData, registrationData, locale, dir, t } = useAuth();

  const isRtl = locale === "ar";

  const [inputType, setInputType] = useState(
    registrationData?.phone ? "phone" : "email"
  );
  const [country, setCountry] = useState(registrationData?.countryCode || "EG");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(
    registrationData?.role?.toLowerCase() || "patient"
  );

  const form = useForm({
    resolver: zodResolver(getStep1Schema(inputType)),
    mode: "onChange",
    defaultValues: {
      email: registrationData?.email || "",
      phone: registrationData?.phone || "",
      password: registrationData?.password || "",
    },
  });

  const {
    setValue,
    trigger,
    handleSubmit,
    clearErrors,
    watch,
    register,
    formState: { errors, isValid },
  } = form;

  useEffect(() => {
    clearErrors();
  }, [inputType, clearErrors]);

  const handleInputChange = (e) => {
    const cleanVal = e.target.value.trim();

    // Detect if input starts with numbers or plus sign
    const isPhone =
      /^[\d+]/.test(cleanVal) || (cleanVal.length > 0 && !isNaN(Number(cleanVal[0])));

    if (isPhone) {
      if (inputType !== "phone") setInputType("phone");
      setValue("phone", cleanVal, { shouldValidate: true });
      setValue("email", "", { shouldValidate: false });
    } else {
      if (inputType !== "email") setInputType("email");
      setValue("email", cleanVal, { shouldValidate: true });
      setValue("phone", "", { shouldValidate: false });
    }
  };

  const saveAndNavigate = (selectedRole, formData) => {
    const callingCode = `+${getCountryCallingCode(country)}`;
    const payload = {
      ...registrationData,
      ...(inputType === "email"
        ? { email: formData.email, phone: "" }
        : { phone: formData.phone, countryCode: callingCode, email: "" }),
      password: formData.password,
      role: selectedRole.toUpperCase(),
    };

    setRegistrationData(payload);
    router.push(`/register/${selectedRole}`);
  };

  const onSubmit = (data) => {
    saveAndNavigate(role, data);
  };

  const handleRoleSelect = async (selectedRole) => {
    setRole(selectedRole);
    const isFormValid = await trigger();
    if (isFormValid) {
      handleSubmit((data) => saveAndNavigate(selectedRole, data))();
    }
  };

  return {
    register,
    watch,
    errors,
    isValid,
    inputType,
    country,
    setCountry,
    showPassword,
    togglePasswordVisibility: () => setShowPassword((prev) => !prev),
    role,
    isRtl,
    locale,
    dir,
    t,
    handleInputChange,
    handleRoleSelect,
    onSubmit: handleSubmit(onSubmit),
  };
};