import { useState, useEffect } from "react";
import { profileSchema } from "../validation/patientValidation";
import {
  usePatientProfileQuery,
  usePatientRelationshipsQuery,
  useUpdatePatientProfileMutation
} from "./usePatientQueries";

export function usePatientProfile() {
  const { data: profile = null, isLoading: loadingProfile, error: errorProfile, refetch: refetchProfile } = usePatientProfileQuery();
  const { data: relationships = [], isLoading: loadingRels, error: errorRels, refetch: refetchRels } = usePatientRelationshipsQuery();
  const updateProfileMutation = useUpdatePatientProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Edit fields
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setDob(profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "");
      setBloodType(profile.bloodType || "O+");
      setEcName(profile.emergencyContact?.name || "");
      setEcPhone(profile.emergencyContact?.phone || "");
    }
  }, [profile]);

  const updateProfile = async (e) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const rawData = {
      bloodType,
      dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
      emergencyContact: {
        name: ecName,
        phone: ecPhone
      }
    };

    // Zod validation check
    const validResult = profileSchema.safeParse(rawData);
    if (!validResult.success) {
      setValidationError(validResult.error.errors[0].message);
      return;
    }

    try {
      const res = await updateProfileMutation.mutateAsync(rawData);
      if (res) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const caregiver = relationships.find((r) => r.status === "ACCEPTED")?.caregiverId || null;

  const refetchAll = () => {
    refetchProfile();
    refetchRels();
  };

  const queryError = errorProfile || errorRels;

  return {
    profile,
    caregiver,
    loading: loadingProfile || loadingRels || updateProfileMutation.isPending,
    error: queryError ? queryError.message : null,
    isEditing,
    setIsEditing,
    saving: updateProfileMutation.isPending,
    validationError,
    phone,
    setPhone,
    dob,
    setDob,
    bloodType,
    setBloodType,
    ecName,
    setEcName,
    ecPhone,
    setEcPhone,
    updateProfile,
    refetch: refetchAll
  };
}
