import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMedicationsThunk } from "../store/patientSlice";
import {
  selectPatientMedications,
  selectPatientLoading,
  selectPatientError
} from "../store/patientSelectors";

export function useMedicationsCabinet(filterType = "all") {
  const dispatch = useDispatch();
  const medications = useSelector(selectPatientMedications);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);

  const fetchMedications = useCallback(() => {
    dispatch(fetchMedicationsThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const filteredMeds = medications.filter((med) => {
    if (filterType === "active") return med.isActive;
    if (filterType === "refill") return med.inventory.currentQuantity <= med.inventory.refillThreshold;
    return true;
  });

  return {
    medications,
    filteredMeds,
    loading,
    error,
    refetch: fetchMedications
  };
}
