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

  // Profile Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [height, setHeight] = useState(168);
  const [weight, setWeight] = useState(62.5);
  const [allergiesText, setAllergiesText] = useState("PENICILLIN");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  // Emergency Contacts State
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: "ec-1", name: "Martha Sarah", relationship: "Mother", phone: "+1 (555) 019-2831", isPrimary: true }
  ]);

  // Addresses State
  const [addresses, setAddresses] = useState([
    { id: "addr-1", type: "Home Address", street: "452 Ocean View Terrace", city: "San Francisco", state: "CA", postalCode: "94121", isPrimary: true },
    { id: "addr-2", type: "Office / Shipping", street: "101 Innovation Blvd, Suite 400", city: "Palo Alto", state: "CA", postalCode: "94301", isPrimary: false }
  ]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setPhone(profile.phone || "");
      setDob(profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "1992-08-24");
      setBloodType(profile.bloodType || "O+");
      setHeight(profile.height || 168);
      setWeight(profile.weight || 62.5);
      setProfilePictureUrl(profile.profilePictureUrl || "");
      
      if (Array.isArray(profile.allergies) && profile.allergies.length > 0) {
        setAllergiesText(profile.allergies.join(", "));
      }

      if (Array.isArray(profile.emergencyContact) && profile.emergencyContact.length > 0) {
        setEmergencyContacts(
          profile.emergencyContact.map((ec, i) => ({
            id: ec._id || `ec-${i}`,
            name: ec.name || "Emergency Contact",
            relationship: ec.relationship || "Family",
            phone: ec.phone || "+1 (555) 000-0000",
            isPrimary: i === 0,
          }))
        );
      }

      if (Array.isArray(profile.address) && profile.address.length > 0) {
        setAddresses(
          profile.address.map((addr, i) => ({
            id: addr._id || `addr-${i}`,
            type: i === 0 ? "Home Address" : "Office / Shipping",
            street: addr.street || "",
            city: addr.city || "",
            state: addr.state || "",
            postalCode: addr.postalCode || "",
            isPrimary: i === 0,
          }))
        );
      }
    }
  }, [profile]);

  const updateProfile = async (customPayload) => {
    setValidationError(null);

    const rawData = customPayload || {
      firstName,
      lastName,
      bloodType,
      dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
      height: Number(height),
      weight: Number(weight),
      allergies: allergiesText ? allergiesText.split(",").map(s => s.trim()) : ["PENICILLIN"],
      profilePictureUrl,
    };

    try {
      const res = await updateProfileMutation.mutateAsync(rawData);
      if (res) {
        setIsEditing(false);
      }
      return res;
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
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
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    dob,
    setDob,
    bloodType,
    setBloodType,
    height,
    setHeight,
    weight,
    setWeight,
    allergiesText,
    setAllergiesText,
    profilePictureUrl,
    setProfilePictureUrl,
    emergencyContacts,
    setEmergencyContacts,
    addresses,
    setAddresses,
    updateProfile,
    refetch: refetchAll
  };
}
