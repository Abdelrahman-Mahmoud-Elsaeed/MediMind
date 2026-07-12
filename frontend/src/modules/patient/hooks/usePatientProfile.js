import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfileThunk, fetchRelationshipsThunk, updateProfileThunk } from "../store/patientSlice";
import {
  selectPatientProfile,
  selectPatientRelationships,
  selectPatientLoading,
  selectPatientError
} from "../store/patientSelectors";
import { profileSchema } from "../validation/patientValidation";

export function usePatientProfile() {
  const dispatch = useDispatch();
  const profile = useSelector(selectPatientProfile);
  const relationships = useSelector(selectPatientRelationships);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Edit fields
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");

  const fetchProfileData = useCallback(() => {
    dispatch(fetchProfileThunk());
    dispatch(fetchRelationshipsThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

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
      setSaving(true);
      const res = await dispatch(updateProfileThunk(rawData));
      if (res.payload) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const caregiver = relationships.find((r) => r.status === "ACCEPTED")?.caregiverId || null;

  return {
    profile,
    caregiver,
    loading,
    error,
    isEditing,
    setIsEditing,
    saving,
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
    refetch: fetchProfileData
  };
}
