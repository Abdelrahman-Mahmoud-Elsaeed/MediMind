'use client';
import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import {
  useMedications,
  useUpdateMedication
} from '@/modules/medication/hooks/useMedicationHooks';
import { Card, Button } from '@/shared/components/ui';
import { showToast } from '@/shared/components/ui/toast';
import { ArrowLeft, Save, Pill } from 'lucide-react';

export default function EditMedicationPage({ params }) {
  const router = useRouter();
  const unwrappedParams = params && typeof params.then === 'function' ? use(params) : params;
  const medicationId = unwrappedParams?.id;

  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: apiMedications = [], isLoading } = useMedications();
  const updateMedicationMutation = useUpdateMedication();

  const existingMed = apiMedications.find(
    (m) => String(m.id || m._id) === String(medicationId)
  );

  const [form, setForm] = useState({
    name: '',
    strength: '500mg',
    formType: 'TABLET',
    frequency: 'DAILY',
    firstDoseTime: '08:00',
    currentStock: 30,
    totalStock: 30,
    refillThreshold: 5,
    relationToMeals: 'AFTER_MEALS',
    notes: '',
    isChronic: true,
  });

  useEffect(() => {
    if (existingMed) {
      setForm({
        name: existingMed.name || '',
        strength: existingMed.dosage || existingMed.strength || existingMed.instructions?.notes || '500mg',
        formType: existingMed.formType || 'TABLET',
        frequency: existingMed.schedule?.frequency || existingMed.frequency || 'DAILY',
        firstDoseTime: existingMed.schedule?.firstDoseTime || existingMed.time || '08:00',
        currentStock: existingMed.inventory?.currentQuantity ?? existingMed.currentStock ?? 30,
        totalStock: existingMed.inventory?.initialQuantity ?? existingMed.totalStock ?? 30,
        refillThreshold: existingMed.inventory?.refillThreshold ?? existingMed.refillThreshold ?? 5,
        relationToMeals: existingMed.instructions?.relationToMeals || existingMed.relationToMeals || 'AFTER_MEALS',
        notes: existingMed.instructions?.notes || '',
        isChronic: existingMed.isChronic ?? true,
      });
    }
  }, [existingMed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!existingMed) return;

    const payload = {
      name: form.name,
      formType: form.formType,
      isChronic: form.isChronic,
      inventory: {
        initialQuantity: Number(form.totalStock),
        currentQuantity: Number(form.currentStock),
        doseAmount: 1,
        refillThreshold: Number(form.refillThreshold),
      },
      instructions: {
        relationToMeals: form.relationToMeals,
        notes: form.notes || form.strength,
      },
      schedule: {
        frequency: form.frequency === '2x Daily' ? 'DAILY' : form.frequency,
        dosesPerDay: form.frequency === '2x Daily' ? 2 : 1,
        firstDoseTime: form.firstDoseTime,
        startDate: existingMed.schedule?.startDate || new Date().toISOString(),
      },
    };

    updateMedicationMutation.mutate(
      {
        id: existingMed.id || existingMed._id,
        data: payload,
      },
      {
        onSuccess: () => {
          showToast({
            title: isAr ? 'تم بنجاح' : 'Success',
            message: isAr ? 'تم تحديث الدواء بنجاح!' : 'Medication updated successfully!',
            type: 'success',
            isRtl: isAr,
          });
          router.push('/medications');
        },
        onError: () => {
          showToast({
            title: isAr ? 'خطأ' : 'Error',
            message: isAr ? 'تعذر تحديث الدواء. يرجى المحاولة مرة أخرى.' : 'Unable to update medication. Please try again.',
            type: 'error',
            isRtl: isAr,
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <MainLayout activePath="/medications">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
          <p className="text-sm text-on-surface-variant">{isAr ? 'جاري تحميل بيانات الدواء...' : 'Loading medication data...'}</p>
        </div>
      </MainLayout>
    );
  }

  if (!existingMed) {
    return (
      <MainLayout activePath="/medications">
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Pill className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">{isAr ? 'لم يتم العثور على الدواء' : 'Medication Not Found'}</h2>
          <Button onClick={() => router.push('/medications')} className="bg-teal-600 text-white">
            {isAr ? 'العودة للخزانة' : 'Return to Cabinet'}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activePath="/medications">
      <div className="max-w-250 mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/medications">
              <ArrowLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-on-surface">
            {isAr ? `تعديل ${existingMed.name}` : `Edit ${existingMed.name}`}
          </h1>
        </div>

        <Card className="bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {isAr ? 'اسم الدواء' : 'Medication Name'}
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'الجرعة / التركيز' : 'Dosage Strength'}
                </label>
                <input
                  type="text"
                  required
                  value={form.strength}
                  onChange={(e) => setForm({ ...form, strength: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'شكل الدواء' : 'Form Type'}
                </label>
                <select
                  value={form.formType}
                  onChange={(e) => setForm({ ...form, formType: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                >
                  <option value="TABLET">{isAr ? 'قرص' : 'Tablet'}</option>
                  <option value="CAPSULE">{isAr ? 'كبسولة' : 'Capsule'}</option>
                  <option value="SYRUP">{isAr ? 'شراب' : 'Syrup'}</option>
                  <option value="INJECTION">{isAr ? 'حقنة' : 'Injection'}</option>
                  <option value="DROP">{isAr ? 'قطرات' : 'Drops'}</option>
                  <option value="CREAM">{isAr ? 'كريم' : 'Cream'}</option>
                  <option value="OTHER">{isAr ? 'غير ذلك' : 'Other'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'التكرار' : 'Frequency'}
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                >
                  <option value="DAILY">{isAr ? 'يومياً' : 'Daily'}</option>
                  <option value="2x Daily">{isAr ? 'مرتين يومياً' : '2x Daily'}</option>
                  <option value="WEEKLY">{isAr ? 'أسبوعياً' : 'Weekly'}</option>
                  <option value="AS_NEEDED">{isAr ? 'عند الحاجة' : 'As Needed'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'وقت الجرعة الأولى' : 'First Dose Time'}
                </label>
                <input
                  type="time"
                  required
                  value={form.firstDoseTime}
                  onChange={(e) => setForm({ ...form, firstDoseTime: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'المخزون الحالي' : 'Current Stock'}
                </label>
                <input
                  type="number"
                  required
                  value={form.currentStock}
                  onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'إجمالي العبوة' : 'Total Package Stock'}
                </label>
                <input
                  type="number"
                  required
                  value={form.totalStock}
                  onChange={(e) => setForm({ ...form, totalStock: Number(e.target.value) })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'حد إشعار التعبئة' : 'Refill Threshold'}
                </label>
                <input
                  type="number"
                  required
                  value={form.refillThreshold}
                  onChange={(e) => setForm({ ...form, refillThreshold: Number(e.target.value) })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {isAr ? 'الارتباط بالوجبة' : 'Relation to Meals'}
              </label>
              <select
                value={form.relationToMeals}
                onChange={(e) => setForm({ ...form, relationToMeals: e.target.value })}
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
              >
                <option value="NONE">{isAr ? 'لا يوجد' : 'None'}</option>
                <option value="BEFORE_MEALS">{isAr ? 'قبل الوجبة' : 'Before Meals'}</option>
                <option value="AFTER_MEALS">{isAr ? 'بعد الوجبة' : 'After Meals'}</option>
                <option value="WITH_FOOD">{isAr ? 'مع الطعام' : 'With Food'}</option>
                <option value="ON_EMPTY_STOMACH">{isAr ? 'على معدة فارغة' : 'On Empty Stomach'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                {isAr ? 'ملاحظات وتعليمات' : 'Notes & Instructions'}
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                placeholder={isAr ? 'أدخل أي ملاحظات خاصة للجرعة...' : 'Enter special dosage instructions...'}
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => router.push('/medications')}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={updateMedicationMutation.isPending} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                <Save className="w-4 h-4 mr-2" />
                {updateMedicationMutation.isPending ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
