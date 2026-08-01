import { useState } from "react";
import { useTranslation } from "@/shared/lib/i18nContext";
import { conditionSchema } from "@/modules/patient/validation/patientValidation";
import {
  usePatientConditionsQuery,
  useAddConditionMutation,
  useDeleteConditionMutation,
} from "@/modules/patient/hooks/usePatientQueries";

export function useMedicalRecords() {
  const { locale } = useTranslation();

  const { data: conditions = [], isLoading: loadingConditions, error: queryError } = usePatientConditionsQuery();
  const addConditionMutation = useAddConditionMutation();
  const deleteConditionMutation = useDeleteConditionMutation();

  const [diseaseName, setDiseaseName] = useState("");
  const [isChronic, setIsChronic] = useState(true);
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState(null);

  const [uploadedDocs, setUploadedDocs] = useState([
    {
      id: "doc-1",
      title: "Blood Test Results - Full Panel",
      category: "Lab Results",
      date: "May 14, 2026",
      fileName: "Blood_Panel_May2026.pdf",
      fileSize: "2.4 MB",
      type: "pdf",
    },
    {
      id: "doc-2",
      title: "Cardiology Consultation Summary",
      category: "Specialist Report",
      date: "Apr 02, 2026",
      fileName: "Cardio_Summary.png",
      fileSize: "1.1 MB",
      type: "image",
    },
  ]);

  const addCondition = async (e) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const rawData = {
      diseaseName,
      isChronic,
      diagnosedDate: diagnosedDate || undefined,
      notes: notes || undefined,
    };

    const validResult = conditionSchema.safeParse(rawData);
    if (!validResult.success) {
      setValidationError(validResult.error.errors[0].message);
      return;
    }

    try {
      await addConditionMutation.mutateAsync({
        diseaseName,
        isChronic,
        diagnosedDate: diagnosedDate ? new Date(diagnosedDate).toISOString() : undefined,
        notes: notes || undefined,
      });

      setDiseaseName("");
      setIsChronic(true);
      setDiagnosedDate("");
      setNotes("");
    } catch (err) {
      setValidationError("Failed to add medical condition.");
    }
  };

  const deleteCondition = async (conditionId) => {
    try {
      await deleteConditionMutation.mutateAsync(conditionId);
    } catch (err) {
      alert("Failed to delete condition");
    }
  };

  const uploadSimulatedDocument = () => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: locale === "ar" ? "تقرير صحي مرفق حديثاً" : "Recently Uploaded Medical Document",
      category: "Vault Import",
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      fileName: `MedRecord_${Date.now().toString().slice(-4)}.pdf`,
      fileSize: "1.8 MB",
      type: "pdf",
    };
    setUploadedDocs((prev) => [newDoc, ...prev]);
  };

  const deleteDocument = (docId) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  return {
    conditions,
    uploadedDocs,
    loading: loadingConditions,
    error: queryError ? queryError.message : null,
    submitting: addConditionMutation.isPending,
    validationError,
    diseaseName,
    setDiseaseName,
    isChronic,
    setIsChronic,
    diagnosedDate,
    setDiagnosedDate,
    notes,
    setNotes,
    addCondition,
    deleteCondition,
    uploadSimulatedDocument,
    deleteDocument,
  };
}
