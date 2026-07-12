import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConditionsThunk, addConditionThunk, deleteConditionThunk } from "../store/patientSlice";
import {
  selectPatientConditions,
  selectPatientLoading,
  selectPatientError
} from "../store/patientSelectors";
import { useTranslation } from "@/shared/lib/i18nContext";
import { conditionSchema } from "../validation/patientValidation";

export function useMedicalRecords() {
  const dispatch = useDispatch();
  const { locale } = useTranslation();
  
  const conditions = useSelector(selectPatientConditions);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);
  
  const [submitting, setSubmitting] = useState(false);
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

  const fetchConditions = useCallback(() => {
    dispatch(fetchConditionsThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchConditions();
  }, [fetchConditions]);

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
      setSubmitting(true);
      const res = await dispatch(addConditionThunk(rawData));
      if (res.payload) {
        setDiseaseName("");
        setDiagnosedDate("");
        setNotes("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCondition = async (conditionId) => {
    dispatch(deleteConditionThunk(conditionId));
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
    error,
    submitting,
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
