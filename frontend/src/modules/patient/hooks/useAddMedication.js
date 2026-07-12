import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMedicationThunk, fetchConditionsThunk, addConditionThunk } from "../store/patientSlice";
import { selectPatientConditions } from "../store/patientSelectors";
import { useTranslation } from "@/shared/lib/i18nContext";
import { addMedicationSchema } from "../validation/patientValidation";
import { patientService } from "../services/patientService";

export function useAddMedication(onSuccess) {
  const dispatch = useDispatch();
  const { locale } = useTranslation();
  const conditions = useSelector(selectPatientConditions);

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scannedMedInfo, setScannedMedInfo] = useState(null);
  const [selectedConditionId, setSelectedConditionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    strength: "500mg",
    frequency: "DAILY",
    dosesPerDay: 1,
    time: "08:00",
    stock: "60",
    type: "CAPSULE",
    relationToMeals: "NONE",
    isChronic: true
  });

  useEffect(() => {
    dispatch(fetchConditionsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (conditions.length > 0 && !selectedConditionId) {
      setSelectedConditionId(conditions[0]._id || conditions[0].conditionId);
    }
  }, [conditions, selectedConditionId]);

  const triggerScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setScannedMedInfo(null);
  };

  const captureScan = async (forceFail = false) => {
    try {
      const data = await patientService.scanPrescription(
        forceFail ? "low_confidence_mock_data" : "normal_high_confidence_mock_data"
      );
      if (data?.success) {
        setScannedMedInfo(data.data);
        setScanResult("success");
      } else {
        setScanResult("error");
      }
    } catch (err) {
      setScanResult("error");
    }
  };

  const autofill = () => {
    if (scannedMedInfo) {
      setForm((prev) => ({
        ...prev,
        name: scannedMedInfo.name,
        type: scannedMedInfo.formType
      }));
    }
    setIsScanning(false);
    setScanResult(null);
  };

  const cancelScan = () => {
    setIsScanning(false);
    setScanResult(null);
  };

  const submitForm = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;

    setValidationError(null);

    // Zod Validation Check
    const rawData = {
      name: form.name,
      strength: form.strength,
      formType: form.type,
      frequency: form.frequency === "2x Daily" ? "DAILY" : form.frequency,
      firstDoseTime: form.time,
      relationToMeals: form.relationToMeals,
      initialQuantity: parseInt(form.stock) || 60,
      refillThreshold: 5
    };

    const validResult = addMedicationSchema.safeParse(rawData);
    if (!validResult.success) {
      setValidationError(validResult.error.errors[0].message);
      return;
    }

    try {
      setSubmitting(true);
      let conditionId = selectedConditionId;
      if (!conditionId) {
        // Create default condition
        const condAction = await dispatch(
          addConditionThunk({
            diseaseName: locale === "ar" ? "رعاية صحية عامة" : "General Health Care",
            isChronic: true
          })
        );
        if (condAction.payload) {
          conditionId = condAction.payload.conditionId;
        }
      }

      let dosesCount = parseInt(form.dosesPerDay) || 1;
      let freq = form.frequency;
      if (freq === "2x Daily") {
        freq = "DAILY";
        dosesCount = 2;
      }

      const payload = {
        conditionId,
        name: form.name,
        formType: form.type,
        isChronic: form.isChronic,
        inventory: {
          initialQuantity: rawData.initialQuantity,
          currentQuantity: rawData.initialQuantity,
          doseAmount: 1,
          refillThreshold: rawData.refillThreshold
        },
        instructions: {
          relationToMeals: form.relationToMeals,
          notes: form.strength
        },
        schedule: {
          frequency: freq,
          dosesPerDay: dosesCount,
          firstDoseTime: form.time,
          startDate: new Date().toISOString()
        },
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const result = await dispatch(addMedicationThunk(payload));
      if (result.payload && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      alert("Failed to add medication");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    setForm,
    isScanning,
    scanResult,
    scannedMedInfo,
    conditions,
    selectedConditionId,
    setSelectedConditionId,
    submitting,
    validationError,
    triggerScan,
    captureScan,
    autofill,
    cancelScan,
    submitForm
  };
}
