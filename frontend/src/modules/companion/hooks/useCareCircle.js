import { useState } from "react";
import { showError } from "@/shared/components/ui/toast";
import { inviteCaregiverSchema } from "@/modules/patient/validation/patientValidation";
import {
  usePatientRelationshipsQuery,
  useInviteCaregiverMutation,
  useRevokeRelationshipMutation,
  useUpdateRelationshipStatusMutation,
} from "@/modules/patient/hooks/usePatientQueries";

export function useCareCircle() {
  const { data: relationships = [], isLoading, error: queryError } = usePatientRelationshipsQuery();
  const inviteCaregiverMutation = useInviteCaregiverMutation();
  const revokeRelationshipMutation = useRevokeRelationshipMutation();
  const updateStatusMutation = useUpdateRelationshipStatusMutation();

  const [emailInput, setEmailInput] = useState("");
  const [canManageMeds, setCanManageMeds] = useState(true);
  const [canViewRecords, setCanViewRecords] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const activeCaregivers = relationships.filter(
    (r) => r.status === "ACCEPTED" || r.status === "ACTIVE"
  );
  const pendingIncoming = relationships.filter(
    (r) => r.status === "PENDING" && r.initiatedBy === "CAREGIVER"
  );
  const pendingOutgoing = relationships.filter(
    (r) => r.status === "PENDING" && r.initiatedBy === "PATIENT"
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
        targetEmail: emailInput,
        permissions: {
          canAddMedication: canManageMeds,
          canEditMedication: canManageMeds,
          canDeleteMedication: canManageMeds,
          canViewMedicalRecords: canViewRecords,
          canEditMedicalRecords: false,
          canViewDoseSchedule: true,
          canConfirmDose: canManageMeds,
          canOrderRefills: canManageMeds,
          canReceiveNotifications: true,
        },
      });

      setEmailInput("");
      setCanManageMeds(true);
      setCanViewRecords(false);
    } catch (err) {
      setValidationError(err?.response?.data?.message || "Failed to send invitation. Please verify caregiver email.");
    }
  };

  const respondToRequest = async (relationshipId, status) => {
    try {
      await updateStatusMutation.mutateAsync({ relationshipId, status });
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to update request status", "Error");
    }
  };

  const revokeRelationship = async (relationshipId) => {
    try {
      await revokeRelationshipMutation.mutateAsync(relationshipId);
    } catch (err) {
      showError("Failed to revoke relationship", "Error");
    }
  };

  return {
    loading: isLoading,
    error: queryError ? queryError.message : null,
    submitting: inviteCaregiverMutation.isPending,
    updatingStatus: updateStatusMutation.isPending,
    emailInput,
    setEmailInput,
    canManageMeds,
    setCanManageMeds,
    canViewRecords,
    setCanViewRecords,
    activeCaregivers,
    pendingIncoming,
    pendingOutgoing,
    pendingInvitations,
    sendInvitation,
    respondToRequest,
    revokeRelationship,
    validationError,
  };
}
