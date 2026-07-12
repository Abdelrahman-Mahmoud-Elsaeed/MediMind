import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRelationshipsThunk,
  inviteCaregiverThunk,
  revokeRelationshipThunk
} from "../store/patientSlice";
import {
  selectPatientRelationships,
  selectPatientLoading,
  selectPatientError
} from "../store/patientSelectors";
import { inviteCaregiverSchema } from "../validation/patientValidation";

export function useCareCircle() {
  const dispatch = useDispatch();
  const relationships = useSelector(selectPatientRelationships);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);

  const [submitting, setSubmitting] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [canManageMeds, setCanManageMeds] = useState(true);
  const [canViewRecords, setCanViewRecords] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const fetchRelationships = useCallback(() => {
    dispatch(fetchRelationshipsThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

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
      setSubmitting(true);
      const res = await dispatch(inviteCaregiverThunk(rawData));
      if (res.payload) {
        setEmailInput("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const revokeRelationship = async (relationshipId) => {
    dispatch(revokeRelationshipThunk(relationshipId));
  };

  const activeCaregivers = relationships.filter((r) => r.status === "ACCEPTED");
  const pendingInvitations = relationships.filter((r) => r.status === "PENDING");

  return {
    relationships,
    loading,
    error,
    submitting,
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
