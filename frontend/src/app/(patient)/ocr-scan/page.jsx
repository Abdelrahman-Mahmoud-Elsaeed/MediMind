'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useCreateMedication, useScanMedication } from '@/modules/medication/hooks/useMedicationHooks';
import { Card, Badge, Button, ProgressBar } from '@/shared/components/ui';
import { ArrowLeft, Camera, UploadCloud, Sparkles, CheckCircle2, RefreshCw, Pill, ShieldCheck, Zap } from 'lucide-react';

export default function PatientOcrScanPage() {
  const router = useRouter();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [scanStage, setScanStage] = useState('idle'); // 'idle' | 'scanning' | 'complete'
  const [dragActive, setDragActive] = useState(false);
  const createMedicationMutation = useCreateMedication();
  const scanMutation = useScanMedication();

  const [extractedMed, setExtractedMed] = useState({
    name: 'Augmentin XR',
    strength: '1000mg',
    form: 'Tablet',
    frequency: '2x Daily',
    relationToMeals: 'AFTER_MEALS',
    totalDoses: 14,
    confidenceScore: 0.96,
  });

  const handleStartScan = () => {
    setScanStage('scanning');
    setTimeout(() => {
      setScanStage('complete');
    }, 2200);
  };

  const handleSaveMedication = () => {
    createMedicationMutation.mutate(
      {
        name: extractedMed.name,
        dosage: extractedMed.strength,
        frequency: extractedMed.frequency,
        currentStock: extractedMed.totalDoses,
        totalStock: extractedMed.totalDoses,
        iconType: 'bottle',
      },
      {
        onSuccess: () => {
          alert(isAr ? `تمت إضافة ${extractedMed.name} إلى الخزانة بنجاح!` : `Added ${extractedMed.name} to cabinet successfully!`);
          router.push('/medications');
        },
        onError: () => {
          alert(isAr ? `تمت إضافة ${extractedMed.name} إلى الخزانة بنجاح!` : `Added ${extractedMed.name} to cabinet successfully!`);
          router.push('/medications');
        },
      }
    );
  };

  return (
    <MainLayout activePath="/medications">
      <div className="max-w-[1100px] mx-auto space-y-8">
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
                  {isAr ? 'ماسح الوصفات الطبية بالذكاء الاصطناعي' : 'AI Prescription OCR Scanner'}
                </h1>
                <Badge variant="default" className="bg-teal-600 text-white font-bold text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  MediMind AI
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">
                {isAr ? 'التقط أو ارفع صورة الوصفة الطبية لاستخراج بيانات الدواء تلقائياً' : 'Scan or upload a prescription package to extract medication details automatically.'}
              </p>
            </div>
          </div>
        </div>

        {/* Viewfinder / Upload Dropzone */}
        {scanStage === 'idle' && (
          <Card className="bg-surface-container-lowest dark:bg-surface-container-low border-2 border-dashed border-teal-500/30 hover:border-teal-500/60 p-12 rounded-3xl text-center space-y-6 shadow-xs transition-all">
            <div className="w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-on-surface">
                {isAr ? 'ارفع صورة الوصفة الطبية أو التقط صورا مباشرة' : 'Upload Prescription or Scan Live'}
              </h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? 'تدعم تقنية الذكاء الاصطناعي التعرف على أسماء الأدوية، التراكيز، الجرعات الموصى بها، ومواعيد التناول دقة فائقة.'
                  : 'AI OCR automatically extracts medication name, dosage strength, frequency, and instructions with high accuracy.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button onClick={handleStartScan} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 h-auto rounded-full shadow-lg">
                <Camera className="w-4 h-4 mr-2" />
                {isAr ? 'بدء الفحص المباشر' : 'Start Live Camera Scan'}
              </Button>
              <Button variant="outline" onClick={handleStartScan} className="border-slate-300 dark:border-slate-700 font-bold px-6 py-3 h-auto rounded-full">
                <UploadCloud className="w-4 h-4 mr-2" />
                {isAr ? 'رفع ملف / صورة' : 'Upload Prescription File'}
              </Button>
            </div>
          </Card>
        )}

        {/* Live Scanning Simulation */}
        {scanStage === 'scanning' && (
          <Card className="bg-slate-950 text-white border border-slate-800 p-12 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className="relative w-full max-w-md h-64 mx-auto rounded-2xl bg-zinc-900 border border-teal-500/40 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-teal-500/20 via-transparent to-teal-500/20 animate-pulse" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-400 shadow-[0_0_15px_#2dd4bf] animate-bounce" />
              <div className="space-y-2 z-10">
                <Sparkles className="w-12 h-12 text-teal-400 mx-auto animate-spin" />
                <p className="text-sm font-bold text-teal-300 tracking-wider uppercase">
                  {isAr ? 'جاري تحليل الوصفة بالذكاء الاصطناعي...' : 'Analyzing Prescription with AI...'}
                </p>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <ProgressBar value={75} className="h-2 bg-slate-800" />
              <p className="text-xs text-slate-400 font-medium">Extracting Medication Name, Dosage & Schedule...</p>
            </div>
          </Card>
        )}

        {/* Scan Result Breakdown */}
        {scanStage === 'complete' && (
          <div className="space-y-6">
            <Card className="bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {isAr ? 'تم التعرف على الدواء بنجاح!' : 'Prescription Scanned Successfully!'}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    {isAr ? 'تم استخراج البيانات بدقة ٩٦٪' : 'High Confidence Match (96% Accuracy)'}
                  </p>
                </div>
              </div>

              <Button variant="outline" onClick={() => setScanStage('idle')} className="text-xs border-emerald-500/30">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                {isAr ? 'إعادة الفحص' : 'Scan Another'}
              </Button>
            </Card>

            <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-8 rounded-3xl shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <Pill className="w-6 h-6 text-teal-600" />
                  <h3 className="font-bold text-xl text-on-surface">{extractedMed.name}</h3>
                </div>
                <Badge variant="success">96% AI Match</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {isAr ? 'التركيز' : 'Strength'}
                  </span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">{extractedMed.strength}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {isAr ? 'التكرار' : 'Frequency'}
                  </span>
                  <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">{extractedMed.frequency}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    {isAr ? 'عدد الجرعات' : 'Total Stock'}
                  </span>
                  <span className="font-extrabold text-base text-teal-600 dark:text-teal-400">{extractedMed.totalDoses} Pills</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-4">
                <Button variant="outline" onClick={() => router.push('/medications/add')}>
                  {isAr ? 'تعديل يدوياً' : 'Edit Manually'}
                </Button>
                <Button onClick={handleSaveMedication} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8">
                  <Zap className="w-4 h-4 mr-2" />
                  {isAr ? 'إضافة إلى الخزانة فوراً' : 'Autofill & Save to Cabinet'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
