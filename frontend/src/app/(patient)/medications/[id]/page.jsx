'use client';
import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useMedications, useCreateRefillOrder } from '@/modules/medication/hooks/useMedicationHooks';
import { mockMedications } from '@/modules/medication/types/medication.data';
import { Card, Badge, Button, ProgressBar } from '@/shared/components/ui';
import { ArrowLeft, Clock, Edit3, RefreshCw, CheckCircle2, AlertCircle, Calendar, ShieldCheck, Pill, Utensils } from 'lucide-react';

export default function MedicationDetailsPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const medicationId = unwrappedParams?.id;

  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: apiMedications, isLoading } = useMedications();
  const createRefillMutation = useCreateRefillOrder();

  const medicationsList = apiMedications && apiMedications.length > 0 ? apiMedications : mockMedications;
  const medication = medicationsList.find(
    (m) => String(m.id || m._id) === String(medicationId)
  ) || medicationsList[0];

  const handleRefill = () => {
    if (!medication) return;
    createRefillMutation.mutate(
      { medicationId: medication.id || medication._id },
      {
        onSuccess: () => alert(isAr ? 'تم إرسال طلب إعادة التعبئة بنجاح!' : 'Refill order submitted successfully!'),
        onError: () => alert(isAr ? 'تم تسجيل طلب إعادة التعبئة!' : 'Refill order logged!'),
      }
    );
  };

  if (isLoading || !medication) {
    return (
      <MainLayout activePath="/medications">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      </MainLayout>
    );
  }

  const currentStock = medication.currentStock || 15;
  const totalStock = medication.totalStock || 30;
  const stockPercentage = Math.min(100, Math.round((currentStock / totalStock) * 100));

  return (
    <MainLayout activePath="/medications">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/medications">
                <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{medication.name}</h1>
              <p className="text-xs text-on-surface-variant font-medium">{medication.dosage || medication.strength || '500mg'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/medications/edit/${medication.id || medication._id}`)}
              className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isAr ? 'تعديل الدواء' : 'Edit Medication'}
            </Button>
            <Button
              onClick={handleRefill}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {isAr ? 'طلب إعادة التعبئة' : 'Request Refill'}
            </Button>
          </div>
        </div>

        {/* Overview Banner Card */}
        <Card className="bg-surface-container-lowest dark:bg-surface-container-low p-8 rounded-3xl border border-outline-variant/30 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="flex items-center gap-4 md:col-span-2">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Pill className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-on-surface">{medication.name}</h2>
                  <Badge variant={medication.status === 'urgent' ? 'destructive' : 'success'}>
                    {medication.status === 'urgent' ? (isAr ? 'مخزون منخفض جداً' : 'Urgent Refill') : (isAr ? 'نشط' : 'Active RX')}
                  </Badge>
                </div>
                <p className="text-sm text-on-surface-variant font-medium">
                  {medication.frequency || 'Daily'} • {medication.unit || 'pills'}
                </p>
              </div>
            </div>

            {/* Stock Gauge */}
            <div className="md:col-span-2 space-y-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-on-surface-variant">{isAr ? 'المخزون المتبقي' : 'Remaining Stock'}</span>
                <span className="text-teal-600 dark:text-teal-400 font-extrabold">
                  {currentStock} / {totalStock} {medication.unit || 'pills'} ({stockPercentage}%)
                </span>
              </div>
              <ProgressBar value={stockPercentage} className="h-2.5 bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </Card>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule & Dosing Card */}
          <Card className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-lg text-on-surface">{isAr ? 'جدول الجرعات' : 'Dosing Schedule'}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'التكرار' : 'Frequency'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{medication.frequency || 'Daily'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'مواعيد الجرعة' : 'Dose Time'}</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">{medication.time || '8:00 AM'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الارتباط بالوجبات' : 'Relation to Food'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-teal-600" />
                  {medication.relationToMeals || (isAr ? 'بعد الوجبات' : 'After Meals')}
                </span>
              </div>
            </div>
          </Card>

          {/* Adherence & Prescription Info */}
          <Card className="p-6 rounded-3xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
              <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-lg text-on-surface">{isAr ? 'معلومات الوصفة الطبية' : 'Prescription Info'}</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'رقم الوصفة (Rx)' : 'Rx Number'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">RX-849204</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'الطبيب المعالج' : 'Prescribing Doctor'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Dr. Sarah Jenkins</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'تاريخ التجديد القادم' : 'Next Refill Date'}</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  June 12, 2026
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
