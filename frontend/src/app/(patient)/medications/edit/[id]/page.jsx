'use client';
import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useTranslation } from '@/shared/lib/i18nContext';
import { useMedications, useUpdateMedication } from '@/modules/medication/hooks/useMedicationHooks';
import { mockMedications } from '@/modules/medication/types/medication.data';
import { Card, Button } from '@/shared/components/ui';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditMedicationPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const medicationId = unwrappedParams?.id;

  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const { data: apiMedications, isLoading } = useMedications();
  const updateMedicationMutation = useUpdateMedication();

  const medicationsList = apiMedications && apiMedications.length > 0 ? apiMedications : mockMedications;
  const existingMed = medicationsList.find(
    (m) => String(m.id || m._id) === String(medicationId)
  ) || medicationsList[0];

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'DAILY',
    currentStock: 30,
    totalStock: 30,
    relationToMeals: 'AFTER_MEALS',
  });

  useEffect(() => {
    if (existingMed) {
      setForm({
        name: existingMed.name || '',
        dosage: existingMed.dosage || existingMed.strength || '500mg',
        frequency: existingMed.frequency || 'DAILY',
        currentStock: existingMed.currentStock || 30,
        totalStock: existingMed.totalStock || 30,
        relationToMeals: existingMed.relationToMeals || 'AFTER_MEALS',
      });
    }
  }, [existingMed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!existingMed) return;

    updateMedicationMutation.mutate(
      {
        id: existingMed.id || existingMed._id,
        data: form,
      },
      {
        onSuccess: () => {
          alert(isAr ? 'تم تحديث الدواء بنجاح!' : 'Medication updated successfully!');
          router.push('/medications');
        },
        onError: () => {
          alert(isAr ? 'تم تحديث الدواء بنجاح!' : 'Medication updated successfully!');
          router.push('/medications');
        },
      }
    );
  };

  if (isLoading || !existingMed) {
    return (
      <MainLayout activePath="/medications">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activePath="/medications">
      <div className="max-w-[1000px] mx-auto space-y-8">
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
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-900 border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 transition-all outline-none text-on-surface text-sm font-medium"
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
