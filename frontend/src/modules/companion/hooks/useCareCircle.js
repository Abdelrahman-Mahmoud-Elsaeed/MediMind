import { useState } from "react";
import { inviteCaregiverSchema } from "@/modules/patient/validation/patientValidation";
import {
  usePatientRelationshipsQuery,
  useInviteCaregiverMutation,
  useRevokeRelationshipMutation,
} from "@/modules/patient/hooks/usePatientQueries";

export function useCareCircle() {
  const { data: relationships = [], isLoading, error: queryError } = usePatientRelationshipsQuery();
  const inviteCaregiverMutation = useInviteCaregiverMutation();
  const revokeRelationshipMutation = useRevokeRelationshipMutation();

  const [emailInput, setEmailInput] = useState("");
  const [canManageMeds, setCanManageMeds] = useState(true);
  const [canViewRecords, setCanViewRecords] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const activeCaregivers = relationships.filter(
    (r) => r.status === "ACCEPTED" || r.status === "ACTIVE"
  );
  const pendingInvitations = relationships.filter(
    (r) => r.status === "PENDING"
  );

  const sendInvitation = async (e) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const validResult = inviteCaregiverSchema.safeParse({
      caregiverEmail: emailInput,
      permissions: {
        canAddMedication: canManageMeds,
        canViewMedicalRecords: canViewRecords,
      },
    });
    if (!validResult.success) {
      setValidationError(validResult.error.errors[0].message);
      return;
    }

    try {
      await inviteCaregiverMutation.mutateAsync({
        caregiverEmail: emailInput,
        permissions: {
          canManageMedications: canManageMeds,
          canViewMedicalRecords: canViewRecords,
        },
      });

      setEmailInput("");
      setCanManageMeds(true);
      setCanViewRecords(false);
    } catch (err) {
      setValidationError("Failed to send invitation. Please verify caregiver email.");
    }
  };

  const revokeRelationship = async (relationshipId) => {
    try {
      await revokeRelationshipMutation.mutateAsync(relationshipId);
    } catch (err) {
      alert("Failed to revoke relationship");
    }
  };

  return {
    loading: isLoading,
    error: queryError ? queryError.message : null,
    submitting: inviteCaregiverMutation.isPending,
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
    validationError,
  };
}
