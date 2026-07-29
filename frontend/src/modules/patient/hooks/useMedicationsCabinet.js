import { usePatientMedicationsQuery } from "./usePatientQueries";

export function useMedicationsCabinet(filterType = "all") {
  const { data: medications = [], isLoading: loading, error: queryError, refetch } = usePatientMedicationsQuery();

  const filteredMeds = medications.filter((med) => {
    if (filterType === "active") return med.isActive;
    if (filterType === "refill") return med.inventory?.currentQuantity <= med.inventory?.refillThreshold;
    return true;
  });

  return {
    medications,
    filteredMeds,
    loading,
    error: queryError ? queryError.message : null,
    refetch
  };
}
