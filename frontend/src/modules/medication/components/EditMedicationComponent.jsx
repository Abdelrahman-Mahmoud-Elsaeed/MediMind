'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/shared/lib/i18nContext';
import {
  useMedications,
  useUpdateMedication
} from '@/modules/medication/hooks/useMedicationHooks';
import { AppCard, AppButton, AppInput, AppSelect } from '@/shared/components/ui';
import { showToast } from '@/shared/components/ui/toast';
import { ArrowLeft, Save, Pill } from 'lucide-react';

export function EditMedicationComponent({ medicationId }) {
  const router = useRouter();
  const { t, locale } = useTranslation();
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
      const rawFreq = existingMed.schedule?.frequency || existingMed.frequency || 'DAILY';
      const normFreq = (rawFreq === '2x Daily' || rawFreq === 'TWICE_DAILY') ? 'TWICE_DAILY' : rawFreq;

      setForm({
        name: existingMed.name || '',
        strength: existingMed.dosage || existingMed.strength || '500mg',
        formType: existingMed.formType || 'TABLET',
        frequency: normFreq,
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

    const isTwiceDaily = form.frequency === 'TWICE_DAILY' || form.frequency === '2x Daily';
    const validFrequency = ['DAILY', 'WEEKLY', 'AS_NEEDED'].includes(form.frequency)
      ? form.frequency
      : 'DAILY';

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
        frequency: validFrequency,
        dosesPerDay: isTwiceDaily ? 2 : 1,
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
            message: t('medications.updatedSuccess'),
            type: 'success',
            isRtl: isAr,
          });
          router.push('/medications');
        },
        onError: (err) => {
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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-on-surface-variant font-medium">{t('medications.loadingMed')}</p>
      </div>
    );
  }

  if (!existingMed) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-on-surface-variant">
          <Pill className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">{t('medications.notFound')}</h2>
        <AppButton onClick={() => router.push('/medications')}>
          {t('medications.returnToCabinet')}
        </AppButton>
      </div>
    );
  }

  const formTypeOptions = [
    { value: 'TABLET', label: isAr ? 'قرص' : 'Tablet' },
    { value: 'CAPSULE', label: isAr ? 'كبسولة' : 'Capsule' },
    { value: 'SYRUP', label: isAr ? 'شراب' : 'Syrup' },
    { value: 'INJECTION', label: isAr ? 'حقنة' : 'Injection' },
    { value: 'DROP', label: isAr ? 'قطرات' : 'Drops' },
    { value: 'CREAM', label: isAr ? 'كريم' : 'Cream' },
    { value: 'OTHER', label: isAr ? 'غير ذلك' : 'Other' },
  ];

  const frequencyOptions = [
    { value: 'DAILY', label: isAr ? 'يومياً' : 'Daily' },
    { value: 'TWICE_DAILY', label: isAr ? 'مرتين يومياً' : '2x Daily' },
    { value: 'WEEKLY', label: isAr ? 'أسبوعياً' : 'Weekly' },
    { value: 'AS_NEEDED', label: isAr ? 'عند الحاجة' : 'As Needed' },
  ];

  const mealOptions = [
    { value: 'NONE', label: isAr ? 'لا يوجد' : 'None' },
    { value: 'BEFORE_MEALS', label: isAr ? 'قبل الوجبة' : 'Before Meals' },
    { value: 'AFTER_MEALS', label: isAr ? 'بعد الوجبة' : 'After Meals' },
    { value: 'WITH_FOOD', label: isAr ? 'مع الطعام' : 'With Food' },
    { value: 'ON_EMPTY_STOMACH', label: isAr ? 'على معدة فارغة' : 'On Empty Stomach' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          href="/medications" 
          className="p-2 rounded-full hover:bg-surface-container-high text-primary transition-colors"
          title={t('common.actions.back')}
        >
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <h1 className="text-2xl font-extrabold text-on-surface">
          {t('medications.editTitle', { name: existingMed.name })}
        </h1>
      </div>

      <AppCard className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AppInput
            label={t('medications.name')}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AppInput
              label={t('medications.dosage')}
              required
              value={form.strength}
              onChange={(e) => setForm({ ...form, strength: e.target.value })}
            />

            <AppSelect
              label={t('medications.formType')}
              value={form.formType}
              onValueChange={(val) => setForm({ ...form, formType: val })}
              options={formTypeOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AppSelect
              label={t('medications.frequency')}
              value={form.frequency}
              onValueChange={(val) => setForm({ ...form, frequency: val })}
              options={frequencyOptions}
            />

            <AppInput
              label={t('medications.firstDoseTime')}
              type="time"
              required
              value={form.firstDoseTime}
              onChange={(e) => setForm({ ...form, firstDoseTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <AppInput
              label={t('medications.currentStock')}
              type="number"
              required
              value={form.currentStock}
              onChange={(e) => setForm({ ...form, currentStock: Number(e.target.value) })}
            />

            <AppInput
              label={t('medications.totalStock')}
              type="number"
              required
              value={form.totalStock}
              onChange={(e) => setForm({ ...form, totalStock: Number(e.target.value) })}
            />

            <AppInput
              label={t('medications.refillThreshold')}
              type="number"
              required
              value={form.refillThreshold}
              onChange={(e) => setForm({ ...form, refillThreshold: Number(e.target.value) })}
            />
          </div>

          <AppSelect
            label={t('medications.relationToMeals')}
            value={form.relationToMeals}
            onValueChange={(val) => setForm({ ...form, relationToMeals: val })}
            options={mealOptions}
          />

          <div className="space-y-1.5 text-start">
            <label className="block text-xs font-bold text-on-surface-variant">
              {t('medications.notes')}
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface text-sm font-medium"
              placeholder={t('medications.notesPlaceholder')}
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/20">
            <AppButton variant="outline" type="button" onClick={() => router.push('/medications')}>
              {t('common.actions.cancel')}
            </AppButton>
            <AppButton type="submit" isLoading={updateMedicationMutation.isPending} leftIcon={<Save className="w-4 h-4" />}>
              {t('common.actions.save')}
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  );
}

export default EditMedicationComponent;
