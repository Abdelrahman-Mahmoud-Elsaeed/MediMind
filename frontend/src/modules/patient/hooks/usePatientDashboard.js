import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMedicationsThunk,
  fetchDosesThunk,
  confirmDoseThunk,
  skipDoseThunk
} from "../store/patientSlice";
import {
  selectPatientMedications,
  selectPatientDoses,
  selectPatientLoading,
  selectPatientError
} from "../store/patientSelectors";

export function usePatientDashboard() {
  const dispatch = useDispatch();
  const medications = useSelector(selectPatientMedications);
  const doses = useSelector(selectPatientDoses);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);

  const fetchData = useCallback(() => {
    dispatch(fetchMedicationsThunk());
    const dateStr = new Date().toISOString().split("T")[0];
    dispatch(fetchDosesThunk(dateStr));
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmDose = async (doseEventId) => {
    const dateStr = new Date().toISOString().split("T")[0];
    dispatch(confirmDoseThunk({ doseEventId, dateStr }));
  };

  const skipDose = async (doseEventId) => {
    const dateStr = new Date().toISOString().split("T")[0];
    dispatch(skipDoseThunk({ doseEventId, dateStr }));
  };

  const totalDoses = doses.length;
  const takenDoses = doses.filter((d) => d.status === "TAKEN").length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
  const nextDose = doses.find((d) => d.status === "PENDING");

  return {
    medications,
    doses,
    loading,
    error,
    adherenceRate,
    nextDose,
    takenDoses,
    totalDoses,
    confirmDose,
    skipDose,
    refetch: fetchData
  };
}
