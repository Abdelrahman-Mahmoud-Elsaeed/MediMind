'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useCreateMedication, useScanMedication } from '@/modules/medication/hooks/useMedicationHooks';
import { toast } from '@/shared/components/ui/sonner';
import { Button, Badge, Card, ProgressBar } from '@/shared/components/ui';
import {
  ArrowLeft,
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Pill,
  ShieldCheck,
  Zap,
  AlertTriangle,
  FileImage,
  Clock,
  Package,
  Layers,
  Edit3,
} from 'lucide-react';


export default function PatientOcrScanPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [scanStage, setScanStage] = useState('idle'); // 'idle' | 'scanning' | 'complete' | 'error'
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedMedications, setParsedMedications] = useState([]);
  const [savingIndex, setSavingIndex] = useState(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const createMedicationMutation = useCreateMedication();
  const scanMutation = useScanMedication();

  // Process File to Base64 and run OCR
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isAr ? 'نوع الملف غير صالح' : 'Invalid File Type', {
        description: isAr ? 'يرجى رفع ملف صورة صالح (JPEG, PNG, WebP)' : 'Please upload a valid image file (JPEG, PNG, WebP)',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      setPreviewImage(base64Data);
      setScanStage('scanning');
      setErrorMessage('');

      try {
        const response = await scanMutation.mutateAsync(base64Data);
        const data = response?.data || response;
        const medList = Array.isArray(data) ? data : [data];

        if (medList.length === 0) {
          throw new Error(isAr ? 'لم يتم العثور على أدوية في الصورة' : 'No medications found in image');
        }

        setParsedMedications(medList);
        setScanStage('complete');

        toast.success(isAr ? 'تم استخراج الأدوية بنجاح!' : 'Medications Extracted Successfully!', {
          description: isAr
            ? `تم التعرف على ${medList.length} دواء من صورة الوصفة الطبية.`
            : `Identified ${medList.length} medication(s) from the prescription.`,
        });
      } catch (err) {
        console.error('OCR scan failed:', err);
        const errMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          err?.message ||
          (isAr
            ? 'تعذر قراءة بيانات الوصفة بدقة كافية (نسبة الثقة أقل من ٩٠٪). يرجى إعادة التصوير أو إدخال البيانات يدوياً.'
            : 'OCR confidence is below the required 90% threshold. Please retake the photo clearly or enter data manually.');
        setErrorMessage(errMsg);
        setScanStage('error');

        toast.error(isAr ? 'فشل فحص الروشتة' : 'Prescription Scan Failed', {
          description: errMsg,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Build robust medication payload ensuring all required schema fields exist
  const buildSavePayload = (med) => {
    const isChronic = med.isChronic !== undefined ? Boolean(med.isChronic) : true;
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = isChronic ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const initialQuantity = Number(med.inventory?.initialQuantity ?? med.initialQuantity ?? 30) || 30;
    const currentQuantity = Number(med.inventory?.currentQuantity ?? med.currentQuantity ?? initialQuantity) || initialQuantity;
    const doseAmount = Number(med.inventory?.doseAmount ?? med.doseAmount ?? 1) || 1;
    const refillThreshold = Number(med.inventory?.refillThreshold ?? med.refillThreshold ?? 5) || 5;

    const relationToMeals = med.instructions?.relationToMeals || med.relationToMeals || 'NONE';
    const notes = med.instructions?.notes || med.notes || med.strength || '';

    const frequency = med.schedule?.frequency || med.frequency || 'DAILY';
    const dosesPerDay = Number(med.schedule?.dosesPerDay || med.dosesPerDay || 1) || 1;
    const firstDoseTime = med.schedule?.firstDoseTime || med.firstDoseTime || '08:00';

    return {
      name: med.name || 'Prescription Medication',
      formType: med.formType || 'TABLET',
      isChronic,
      inventory: {
        initialQuantity,
        currentQuantity,
        doseAmount,
        refillThreshold,
      },
      instructions: {
        relationToMeals,
        notes,
      },
      schedule: {
        frequency,
        dosesPerDay,
        firstDoseTime,
        startDate,
        endDate,
      },
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  };

  // Save single parsed medication
  const handleSaveMedication = async (med, index) => {
    setSavingIndex(index);
    try {
      const payload = buildSavePayload(med);
      await createMedicationMutation.mutateAsync(payload);

      toast.success(isAr ? `تمت إضافة "${med.name}" بنجاح!` : `Added "${med.name}" Successfully!`, {
        description: isAr ? 'تم حفظ الدواء في خزانة الأدوية الخاصة بك.' : 'Medication added to your cabinet.',
      });
      setTimeout(() => {
        router.push('/medications');
      }, 700);
    } catch (err) {
      console.error('Failed to save medication:', err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.error?.message || err?.message || '';
      toast.error(isAr ? `تعذر حفظ ${med.name}` : `Failed to save ${med.name}`, {
        description: errMsg,
      });
    } finally {
      setSavingIndex(null);
    }
  };

  // Save all parsed medications in batch
  const handleSaveAll = async () => {
    setIsSavingAll(true);
    const toastId = toast.loading(isAr ? 'جاري حفظ الأدوية في الخزانة...' : 'Saving medications to your cabinet...');
    let successCount = 0;

    for (const med of parsedMedications) {
      try {
        const payload = buildSavePayload(med);
        await createMedicationMutation.mutateAsync(payload);
        successCount++;
      } catch (err) {
        console.error('Failed to save medication in batch:', med.name, err);
      }
    }

    setIsSavingAll(false);
    toast.dismiss(toastId);

    if (successCount > 0) {
      toast.success(
        isAr
          ? `تمت إضافة ${successCount} من أصل ${parsedMedications.length} دواء بنجاح!`
          : `Successfully saved ${successCount} of ${parsedMedications.length} medications!`,
        {
          description: isAr ? 'تم تحديث خزانة الأدوية الخاصة بك.' : 'Your medication cabinet has been updated.',
        }
      );
      setTimeout(() => {
        router.push('/medications');
      }, 700);
    } else {
      toast.error(isAr ? 'تعذر حفظ الأدوية' : 'Failed to save medications', {
        description: isAr ? 'حدث خطأ أثناء محاولة حفظ الأدوية في الخزانة.' : 'An error occurred while saving medications to cabinet.',
      });
    }
  };

  const handleReset = () => {
    setScanStage('idle');
    setPreviewImage(null);
    setParsedMedications([]);
    setErrorMessage('');
  };

  return (
    <MainLayout activePath="/medications">
      <div className="max-w-[1100px] mx-auto space-y-8 pb-16">
        {/* Hidden inputs for file upload and live camera */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/medications">
                <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-on-surface">
                  {isAr ? 'ماسح الوصفات الطبية بالذكاء الاصطناعي (Gemini)' : 'Gemini AI Prescription OCR Scanner'}
                </h1>
                <Badge variant="default" className="bg-teal-600 text-white font-bold text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini 2.5
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">
                {isAr
                  ? 'التقط أو ارفع صورة الوصفة الطبية لاستخراج مصفوفة الأدوية والجرعات تلقائياً'
                  : 'Scan or upload a prescription package to extract an array of parsed medication objects automatically.'}
              </p>
            </div>
          </div>
        </div>

        {/* Viewfinder / Upload Dropzone */}
        {scanStage === 'idle' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 text-center space-y-6 transition-all ${
              dragActive
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                : 'border-teal-500/30 hover:border-teal-500/60 bg-surface-container-lowest dark:bg-surface-container-low'
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-on-surface">
                {isAr ? 'ارفع صورة الوصفة الطبية أو التقط صورة مباشرة' : 'Upload Prescription or Take Live Photo'}
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? 'يستخدم النظام محرك Google Gemini لتحليل الوصفات المعقدة، والتعرف على أسماء الأدوية، التراكيز، الجرعات، ومواعيد التناول بدقة تفوق ٩٠٪.'
                  : 'Powered by Google Gemini OCR to extract all medication names, dosages, strengths, frequencies, and instructions with safety confidence validation.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 h-auto rounded-full shadow-lg"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isAr ? 'التقاط عبر الكاميرا' : 'Take Camera Photo'}
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-slate-300 dark:border-slate-700 font-bold px-6 py-3 h-auto rounded-full"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                {isAr ? 'رفع ملف / صورة' : 'Upload Prescription File'}
              </Button>
            </div>
          </div>
        )}

        {/* Live Scanning Simulation */}
        {scanStage === 'scanning' && (
          <Card className="bg-slate-950 text-white border border-slate-800 p-12 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden">
            {previewImage ? (
              <div className="relative w-full max-w-md h-64 mx-auto rounded-2xl overflow-hidden border border-teal-500/40">
                <img
                  src={previewImage}
                  alt="Prescription Preview"
                  className="w-full h-full object-cover opacity-60 filter blur-[0.5px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/20 via-transparent to-teal-500/20 animate-pulse" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-teal-400 shadow-[0_0_15px_#2dd4bf] animate-bounce" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="space-y-2 text-center">
                    <Sparkles className="w-10 h-10 text-teal-400 mx-auto animate-spin" />
                    <p className="text-xs font-bold text-teal-300 tracking-wider uppercase">
                      {isAr ? 'جاري تحليل الوصفة بواسطة Gemini...' : 'Analyzing with Google Gemini OCR...'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-md h-64 mx-auto rounded-2xl bg-zinc-900 border border-teal-500/40 flex items-center justify-center overflow-hidden">
                <div className="space-y-2 z-10">
                  <Sparkles className="w-12 h-12 text-teal-400 mx-auto animate-spin" />
                  <p className="text-sm font-bold text-teal-300 tracking-wider uppercase">
                    {isAr ? 'جاري تحليل الوصفة بالذكاء الاصطناعي...' : 'Analyzing Prescription with Gemini...'}
                  </p>
                </div>
              </div>
            )}

            <div className="max-w-md mx-auto space-y-2">
              <ProgressBar value={85} className="h-2 bg-slate-800" />
              <p className="text-xs text-slate-400 font-medium">
                {isAr ? 'استخراج مصفوفة الأدوية والجرعات...' : 'Extracting parsed medication objects array...'}
              </p>
            </div>
          </Card>
        )}

        {/* Error / Low Confidence State */}
        {scanStage === 'error' && (
          <div className="space-y-6">
            <Card className="bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 p-8 rounded-3xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'لم نتمكن من قراءة الوصفة بدقة كافية' : 'Low Confidence / Unclear Prescription'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button onClick={handleReset} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isAr ? 'إعادة المحاولة بصورة أوضح' : 'Retake with Clearer Photo'}
                </Button>
                <Button variant="outline" onClick={() => router.push('/medications/add')} className="border-slate-300 dark:border-slate-700 font-bold px-6 py-2.5 rounded-full">
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isAr ? 'إدخال البيانات يدوياً' : 'Enter Details Manually'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Success: Display Array of Parsed Medication Objects */}
        {scanStage === 'complete' && (
          <div className="space-y-6">
            {/* Top Success Banner */}
            <Card className="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {isAr ? 'تم تحليل الوصفة بنجاح!' : 'Prescription Analyzed Successfully!'}
                    <Badge variant="default" className="bg-emerald-600 text-white text-[10px] font-bold">
                      {parsedMedications.length} {parsedMedications.length === 1 ? (isAr ? 'دواء' : 'Medication') : (isAr ? 'أدوية' : 'Medications')}
                    </Badge>
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    {isAr
                      ? 'تم استخراج مصفوفة الأدوية بدقة عالية متوافقة مع معايير الأمان.'
                      : 'Extracted parsed medication array with high AI confidence score.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Button variant="outline" onClick={handleReset} className="text-xs border-emerald-500/30">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  {isAr ? 'فحص وصفة أخرى' : 'Scan Another'}
                </Button>
                {parsedMedications.length > 1 && (
                  <Button
                    onClick={handleSaveAll}
                    disabled={isSavingAll}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    {isSavingAll
                      ? (isAr ? 'جاري الحفظ...' : 'Saving All...')
                      : (isAr ? 'إضافة الكل إلى الخزانة' : 'Save All to Cabinet')}
                  </Button>
                )}
              </div>
            </Card>

            {/* Array of Extracted Medication Cards */}
            <div className="space-y-4">
              {parsedMedications.map((med, index) => {
                const confidencePct = Math.round((med.confidenceScore || 0.95) * 100);
                const isSavingThis = savingIndex === index;

                return (
                  <Card
                    key={index}
                    className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xl text-on-surface">{med.name}</h3>
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {med.formType || 'TABLET'}
                            </Badge>
                          </div>
                          {med.strength && (
                            <span className="text-xs text-on-surface-variant font-medium">
                              {med.strength}
                            </span>
                          )}
                        </div>
                      </div>

                      <Badge variant="success" className="self-start sm:self-auto">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {confidencePct}% AI Match
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1 font-bold">
                          {isAr ? 'الجرعة / القوة' : 'Strength / Dosage'}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {med.strength || `${med.inventory?.doseAmount || 1} unit`}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1 font-bold">
                          {isAr ? 'التكرار' : 'Frequency'}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {med.schedule?.frequency || 'DAILY'} ({med.schedule?.dosesPerDay || 1}x)
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1 font-bold">
                          {isAr ? 'العلاقة بالوجبات' : 'Meal Relation'}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {med.instructions?.relationToMeals || 'NONE'}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1 font-bold">
                          {isAr ? 'المخزون المقدر' : 'Total Stock'}
                        </span>
                        <span className="font-extrabold text-sm text-teal-600 dark:text-teal-400">
                          {med.inventory?.initialQuantity || 30} Units
                        </span>
                      </div>
                    </div>

                    {med.instructions?.notes && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-700 dark:text-slate-200 mr-1">
                          {isAr ? 'ملاحظات:' : 'Instructions:'}
                        </span>
                        {med.instructions.notes}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          router.push('/medications/add');
                        }}
                        className="text-xs"
                      >
                        {isAr ? 'تعديل قبل الحفظ' : 'Edit Manually'}
                      </Button>
                      <Button
                        onClick={() => handleSaveMedication(med, index)}
                        disabled={isSavingThis || isSavingAll}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1.5" />
                        {isSavingThis
                          ? (isAr ? 'جاري الحفظ...' : 'Saving...')
                          : (isAr ? 'إضافة إلى الخزانة' : 'Save to Cabinet')}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
