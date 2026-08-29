import { useState, useEffect } from "react";
import { showError } from "@/shared/components/ui/toast";
import { useTranslation } from "@/shared/lib/i18nContext";
import { toast } from "@/shared/components/ui/sonner";
import { addMedicationSchema } from "@/modules/patient/validation/patientValidation";
import {
  usePatientConditionsQuery,
  useAddConditionMutation,
  useAddPatientMedicationMutation,
  useScanPrescriptionMutation
} from "@/modules/patient/hooks/usePatientQueries";

export function useAddMedication(onSuccess) {
  const { locale } = useTranslation();

  const { data: conditions = [] } = usePatientConditionsQuery();
  const addConditionMutation = useAddConditionMutation();
  const addMedicationMutation = useAddPatientMedicationMutation();
  const scanPrescriptionMutation = useScanPrescriptionMutation();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scannedMedInfo, setScannedMedInfo] = useState(null);
  const [selectedConditionId, setSelectedConditionId] = useState("");
  const [validationError, setValidationError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    strength: "500mg",
    frequency: "DAILY_1",
    dosesPerDay: 1,
    maxDosesPerDay: 1,
    time: "08:00",
    stock: "60",
    currentStock: "60",
    refillThreshold: "5",
    doseAmount: "1",
    type: "CAPSULE",
    relationToMeals: "NONE",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
    prescribingDoctor: "",
    pharmacyName: "",
    isChronic: true
  });

  useEffect(() => {
    // Check if coming from /ocr-scan with pre-scanned OCR data
    if (typeof window !== "undefined") {
      const storedOcrData = sessionStorage.getItem("medimind_ocr_autofill");
      if (storedOcrData) {
        try {
          const parsed = JSON.parse(storedOcrData);
          if (parsed && parsed.name) {
            setForm((prev) => ({
              ...prev,
              name: parsed.name || prev.name,
              type: parsed.formType || prev.type,
              strength: parsed.strength || prev.strength,
              stock: String(parsed.inventory?.initialQuantity || prev.stock),
              currentStock: String(parsed.inventory?.currentQuantity || prev.currentStock),
              doseAmount: String(parsed.inventory?.doseAmount || prev.doseAmount),
              relationToMeals: parsed.instructions?.relationToMeals || prev.relationToMeals,
              notes: parsed.instructions?.notes || prev.notes,
            }));
            toast.success(
              locale === "ar"
                ? `تم تعبئة بيانات "${parsed.name}" من الماسح الضوئي`
                : `Autofilled "${parsed.name}" from AI OCR scan!`
            );
          }
        } catch (e) {
          // Ignore json parse error
        } finally {
          sessionStorage.removeItem("medimind_ocr_autofill");
        }
      }
    }
  }, [locale]);

  const triggerScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setScannedMedInfo(null);
  };

  const captureScan = async (inputData) => {
    try {
      let imageBase64 = "";

      if (typeof inputData === "string" && inputData.startsWith("data:image")) {
        imageBase64 = inputData;
      } else if (inputData instanceof File) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(inputData);
        });
      } else if (inputData === true) {
        imageBase64 = "low_confidence";
      } else {
        imageBase64 = "mock_single";
      }

      const data = await scanPrescriptionMutation.mutateAsync(imageBase64);
      const resPayload = data?.data || data;
      const parsedItem = Array.isArray(resPayload) ? resPayload[0] : resPayload;
      if (parsedItem && parsedItem.name) {
        setScannedMedInfo(parsedItem);
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
        name: scannedMedInfo.name || prev.name,
        type: scannedMedInfo.formType || prev.type,
        strength: scannedMedInfo.strength || prev.strength,
        stock: String(scannedMedInfo.inventory?.initialQuantity || prev.stock),
        currentStock: String(scannedMedInfo.inventory?.currentQuantity || prev.currentStock),
        doseAmount: String(scannedMedInfo.inventory?.doseAmount || prev.doseAmount),
        relationToMeals: scannedMedInfo.instructions?.relationToMeals || prev.relationToMeals,
        notes: scannedMedInfo.instructions?.notes || prev.notes,
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
    if (addMedicationMutation.isPending) return;

    setValidationError(null);

    // Zod Validation Check
    const rawData = {
      name: form.name,
      strength: form.strength,
      formType: form.type,
      frequency: (form.frequency?.startsWith("DAILY") || form.frequency === "2x Daily") ? "DAILY" : form.frequency,
      firstDoseTime: form.time,
      relationToMeals: form.relationToMeals,
      initialQuantity: parseInt(form.stock) || 60,
      refillThreshold: parseInt(form.refillThreshold) || 5
    };

    const validResult = addMedicationSchema.safeParse(rawData);
    if (!validResult.success) {
      const errMsg = validResult.error?.issues?.[0]?.message || validResult.error?.errors?.[0]?.message || "Validation failed";
      setValidationError(errMsg);
      return;
    }

    try {
      const conditionId = selectedConditionId || undefined;

      let dosesCount = parseInt(form.dosesPerDay) || 1;
      let freq = "DAILY";

      if (form.frequency === "DAILY_1" || form.frequency === "DAILY") {
        freq = "DAILY";
        dosesCount = 1;
      } else if (form.frequency === "DAILY_2" || form.frequency === "2x Daily") {
        freq = "DAILY";
        dosesCount = 2;
      } else if (form.frequency === "DAILY_3") {
        freq = "DAILY";
        dosesCount = 3;
      } else if (form.frequency === "DAILY_4") {
        freq = "DAILY";
        dosesCount = 4;
      } else if (form.frequency === "WEEKLY") {
        freq = "WEEKLY";
        dosesCount = 1;
      } else if (form.frequency === "AS_NEEDED") {
        freq = "AS_NEEDED";
        dosesCount = parseInt(form.maxDosesPerDay) || 1;
      }

      // Compute dose times array automatically
      const timesOfDay = [];
      const [startHour, startMin] = (form.time || "08:00").split(":").map(Number);
      const intervalHours = Math.floor(24 / dosesCount);
      for (let i = 0; i < dosesCount; i++) {
        const h = (startHour + i * intervalHours) % 24;
        const hh = String(h).padStart(2, "0");
        const mm = String(startMin || 0).padStart(2, "0");
        timesOfDay.push(`${hh}:${mm}`);
      }

      const payload = {
        conditionId,
        name: form.name,
        formType: form.type,
        isChronic: Boolean(form.isChronic),
        inventory: {
          initialQuantity: parseInt(form.stock) || 60,
          currentQuantity: parseInt(form.currentStock) || parseInt(form.stock) || 60,
          doseAmount: parseFloat(form.doseAmount) || 1,
          refillThreshold: parseInt(form.refillThreshold) || 5
        },
        instructions: {
          relationToMeals: form.relationToMeals,
          notes: form.notes || form.strength,
          prescribingDoctor: form.prescribingDoctor,
          pharmacyName: form.pharmacyName
        },
        schedule: {
          frequency: freq,
          dosesPerDay: dosesCount,
          firstDoseTime: form.time,
          timesOfDay,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
          endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined
        },
        expirationDate: form.expirationDate ? new Date(form.expirationDate).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      const result = await addMedicationMutation.mutateAsync(payload);
      const resData = result?.data || result;
      toast.success(isAr ? `تمت إضافة "${form.name}" بنجاح!` : `Added "${form.name}" Successfully!`, {
        description: isAr ? 'تم حفظ الدواء في خزانة الأدوية الخاصة بك.' : 'Medication has been saved to your cabinet.',
      });
      if (resData && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || '';
      toast.error(isAr ? 'فشل إضافة الدواء' : 'Failed to add medication', {
        description: errMsg || (isAr ? 'يرجى مراجعة البيانات المدخلة والمحاولة مجدداً.' : 'Please check your inputs and try again.'),
      });

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
    submitting: addMedicationMutation.isPending || addConditionMutation.isPending,
    validationError,
    triggerScan,
    captureScan,
    autofill,
    cancelScan,
    submitForm
  };
}
