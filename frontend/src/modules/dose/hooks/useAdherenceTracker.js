import { useState, useMemo } from "react";
import { useMedications } from "@/modules/medication/hooks/useMedicationHooks";
import {
  usePatientDosesQuery,
  useConfirmDoseMutation,
  useSkipDoseMutation,
} from "@/modules/patient/hooks/usePatientQueries";

export function useAdherenceTracker() {
  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: medications = [], isLoading: loadingMeds, refetch: refetchMeds } = useMedications();
  const { data: doses = [], isLoading: loadingDoses, refetch: refetchDoses } = usePatientDosesQuery(dateStr);

  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();

  const [timeframe, setTimeframe] = useState("30");

  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === "TAKEN").length;
  const missedDoses = doses.filter((d) => d.status === "MISSED").length;
  const skippedDoses = doses.filter((d) => d.status === "SKIPPED").length;

  const totalFinished = takenDoses + missedDoses + skippedDoses;
  const overallAdherence = totalFinished > 0 ? Math.round((takenDoses / totalFinished) * 100) : 100;

  const confirmDose = async (doseEventId) => {
    await confirmDoseMutation.mutateAsync({ doseEventId, dateStr });
  };

  const skipDose = async (doseEventId) => {
    await skipDoseMutation.mutateAsync({ doseEventId, dateStr });
  };

  return {
    medications,
    doses,
    loading: loadingMeds || loadingDoses,
    timeframe,
    setTimeframe,
    overallAdherence,
    totalDoses,
    takenDoses,
    missedDoses,
    skippedDoses,
    confirmDose,
    skipDose,
    refetch: () => {
      refetchMeds();
      refetchDoses();
    },
  };
}
