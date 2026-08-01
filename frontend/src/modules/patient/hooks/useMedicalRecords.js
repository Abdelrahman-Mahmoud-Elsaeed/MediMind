import { useState } from "react";
import { useTranslation } from "@/shared/lib/i18nContext";
import { conditionSchema } from "../validation/patientValidation";
import {
  usePatientConditionsQuery,
  useAddConditionMutation,
  useDeleteConditionMutation
} from "./usePatientQueries";

export function useMedicalRecords() {
  const { locale } = useTranslation();

  const { data: conditions = [], isLoading: loading, error: queryError } = usePatientConditionsQuery();
  const addConditionMutation = useAddConditionMutation();
  const deleteConditionMutation = useDeleteConditionMutation();

  const [validationError, setValidationError] = useState(null);

  // Form states
  const [diseaseName, setDiseaseName] = useState("");
  const [isChronic, setIsChronic] = useState(true);
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [notes, setNotes] = useState("");

  const [uploadedDocs, setUploadedDocs] = useState([
    {
      id: "cbc-report",
      title: "CBC Blood Test Report",
      category: "Lab Result",
      date: "Oct 12, 2024",
      fileName: "cbc_blood_test.pdf",
      fileSize: "1.2 MB",
      type: "pdf"
    },
    {
      id: "rx-metformin",
      title: "Diabetes Prescription",
      category: "Prescription",
      date: "Sep 10, 2024",
      fileName: "rx_metformin.jpg",
      fileSize: "800 KB",
      type: "image"
    }
  ]);

  const addCondition = async (e) => {
    if (e) e.preventDefault();
    if (!diseaseName.trim()) return;

    setValidationError(null);

    const rawData = {
      diseaseName: diseaseName.trim(),
      isChronic,
      diagnosedDate: diagnosedDate ? new Date(diagnosedDate).toISOString() : new Date().toISOString(),
      notes: notes.trim() || undefined
    };

    const validResult = conditionSchema.safeParse(rawData);
    if (!validResult.success) {
      setValidationError(validResult.error.errors[0].message);
      return;
    }

    try {
      const res = await addConditionMutation.mutateAsync(rawData);
      if (res) {
        setDiseaseName("");
        setDiagnosedDate("");
        setNotes("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCondition = async (conditionId) => {
    try {
      await deleteConditionMutation.mutateAsync(conditionId);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadSimulatedDocument = () => {
    const docName = prompt(locale === "ar" ? "أدخل اسماً للملف المحمل:" : "Enter a name for the document to upload:");
    if (!docName) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docName,
      category: locale === "ar" ? "ملف مرفق" : "Uploaded Doc",
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      fileName: `${docName.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      fileSize: "450 KB",
      type: "pdf"
    };
    setUploadedDocs((prev) => [newDoc, ...prev]);
  };

  const deleteDocument = (docId) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.id !== docId));
  };

  return {
    conditions,
    uploadedDocs,
    loading,
    error: queryError ? queryError.message : null,
    submitting: addConditionMutation.isPending || deleteConditionMutation.isPending,
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
    deleteDocument
  };
}
