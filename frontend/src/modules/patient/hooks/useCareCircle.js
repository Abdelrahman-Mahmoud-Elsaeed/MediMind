import { useState } from "react";
import { inviteCaregiverSchema } from "../validation/patientValidation";
import {
  usePatientRelationshipsQuery,
  useInviteCaregiverMutation,
  useRevokeRelationshipMutation
} from "./usePatientQueries";

export function useCareCircle() {
  const { data: relationships = [], isLoading: loading, error: queryError } = usePatientRelationshipsQuery();
  const inviteCaregiverMutation = useInviteCaregiverMutation();
  const revokeRelationshipMutation = useRevokeRelationshipMutation();

  const [emailInput, setEmailInput] = useState("");
  const [canManageMeds, setCanManageMeds] = useState(true);
  const [canViewRecords, setCanViewRecords] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const sendInvitation = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput.trim()) return;

    setValidationError(null);

    const rawData = {
      caregiverEmail: emailInput.trim(),
      permissions: {
        canAddMedication: canManageMeds,
        canViewMedicalRecords: canViewRecords
      }
    };

    const validResult = inviteCaregiverSchema.safeParse(rawData);
    if (!validResult.success) {
      setValidationError(validResult.error.errors[0].message);
      return;
    }

    try {
      const res = await inviteCaregiverMutation.mutateAsync(rawData);
      if (res) {
        setEmailInput("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const revokeRelationship = async (relationshipId) => {
    try {
      await revokeRelationshipMutation.mutateAsync(relationshipId);
    } catch (err) {
      console.error(err);
    }
  };

  const activeCaregivers = relationships.filter((r) => r.status === "ACCEPTED");
  const pendingInvitations = relationships.filter((r) => r.status === "PENDING");

  return {
    relationships,
    loading,
    error: queryError ? queryError.message : null,
    submitting: inviteCaregiverMutation.isPending || revokeRelationshipMutation.isPending,
    emailInput,
    setEmailInput,
    canManageMeds,
    setCanManageMeds,
    canViewRecords,
    setCanViewRecords,
    activeCaregivers,
    pendingInvitations,
    sendInvitation,
    revokeRelationship,
    validationError
  };
}
