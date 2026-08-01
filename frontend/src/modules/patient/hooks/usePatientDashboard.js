import { useMemo } from "react";
import {
  usePatientMedicationsQuery,
  usePatientDosesQuery,
  useConfirmDoseMutation,
  useSkipDoseMutation
} from "./usePatientQueries";

export function usePatientDashboard() {
  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: medications = [], isLoading: loadingMeds, error: errorMeds, refetch: refetchMeds } = usePatientMedicationsQuery();
  const { data: doses = [], isLoading: loadingDoses, error: errorDoses, refetch: refetchDoses } = usePatientDosesQuery(dateStr);

  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();

  const confirmDose = async (doseEventId) => {
    await confirmDoseMutation.mutateAsync({ doseEventId, dateStr });
  };

  const skipDose = async (doseEventId) => {
    await skipDoseMutation.mutateAsync({ doseEventId, dateStr });
  };

  const refetchAll = () => {
    refetchMeds();
    refetchDoses();
  };

  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === "TAKEN").length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
  const nextDose = doses.find((d) => d.status === "PENDING");

  const queryError = errorMeds || errorDoses;

  return {
    medications,
    doses,
    loading: loadingMeds || loadingDoses || confirmDoseMutation.isPending || skipDoseMutation.isPending,
    error: queryError ? queryError.message : null,
    adherenceRate,
    nextDose,
    takenDoses,
    totalDoses,
    confirmDose,
    skipDose,
    refetch: refetchAll
  };
}
