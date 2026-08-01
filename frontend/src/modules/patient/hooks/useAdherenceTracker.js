import { useState, useMemo } from "react";
import {
  usePatientDosesQuery,
  useConfirmDoseMutation,
  useSkipDoseMutation
} from "./usePatientQueries";

export function useAdherenceTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  const { data: doses = [], isLoading: loading, error: queryError, refetch } = usePatientDosesQuery(dateStr);
  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();

  const confirmDose = async (doseEventId) => {
    await confirmDoseMutation.mutateAsync({ doseEventId, dateStr });
  };

  const skipDose = async (doseEventId) => {
    await skipDoseMutation.mutateAsync({ doseEventId, dateStr });
  };

  const changeMonth = (offset) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const takenCount = doses.filter((d) => d.status === "TAKEN").length;
  const missedCount = doses.filter((d) => d.status === "MISSED").length;
  const skippedCount = doses.filter((d) => d.status === "SKIPPED").length;
  const pendingCount = doses.filter((d) => d.status === "PENDING").length;
  const totalCount = doses.length;
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return {
    currentDate,
    selectedDate,
    setSelectedDate,
    doses,
    loading: loading || confirmDoseMutation.isPending || skipDoseMutation.isPending,
    error: queryError ? queryError.message : null,
    takenCount,
    missedCount,
    skippedCount,
    pendingCount,
    adherenceRate,
    confirmDose,
    skipDose,
    changeMonth,
    refetch
  };
}
