import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDosesThunk, confirmDoseThunk, skipDoseThunk } from "../store/patientSlice";
import {
  selectPatientDoses,
  selectPatientLoading,
  selectPatientError
} from "../store/patientSelectors";

export function useAdherenceTracker() {
  const dispatch = useDispatch();
  const doses = useSelector(selectPatientDoses);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchDoses = useCallback((targetDate) => {
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    dispatch(fetchDosesThunk(dateStr));
  }, [dispatch]);

  useEffect(() => {
    fetchDoses(selectedDate);
  }, [selectedDate, fetchDoses]);

  const confirmDose = async (doseEventId) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    dispatch(confirmDoseThunk({ doseEventId, dateStr }));
  };

  const skipDose = async (doseEventId) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    dispatch(skipDoseThunk({ doseEventId, dateStr }));
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
    loading,
    error,
    takenCount,
    missedCount,
    skippedCount,
    pendingCount,
    adherenceRate,
    confirmDose,
    skipDose,
    changeMonth,
    refetch: () => fetchDoses(selectedDate)
  };
}
