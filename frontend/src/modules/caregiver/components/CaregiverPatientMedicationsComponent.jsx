'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Pill, 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  PackageCheck, 
  CheckCircle,
  Activity,
  TrendingUp,
  FileText,
  PlusCircle,
  Edit3,
  StickyNote,
  X
} from 'lucide-react';
import { useTranslation } from '@/shared/lib/i18nContext';
import { AppCard, AppBadge, AppProgressBar } from '@/shared/components/ui';
import { 
  usePatientMedicationsQuery,
  useUpdatePatientMedicationMutation 
} from '../hooks/useCaregiverQueries';

export function CaregiverPatientMedicationsComponent({ patientId }) {
  const { locale } = useTranslation();
  const isAr = locale === 'ar';

  const [activeTab, setActiveTab] = useState('ALL');

  // Modals state
  const [refillMed, setRefillMed] = useState(null);
  const [refillAmount, setRefillAmount] = useState(30);

  const [editMed, setEditMed] = useState(null);
  const [editForm, setEditForm] = useState({
    doseAmount: 1,
    refillThreshold: 5,
    relationToMeals: 'AFTER_MEALS',
    notes: '',
  });

  const [notesMed, setNotesMed] = useState(null);
  const [notesText, setNotesText] = useState('');

  const { data: medications = [], isLoading, isError } = usePatientMedicationsQuery(patientId);
  const updateMedicationMutation = useUpdatePatientMedicationMutation(patientId);

  const filteredMeds = medications.filter((m) => {
    if (activeTab === 'ACTIVE') return m.isActive;
    if (activeTab === 'LOW_STOCK') {
      const current = m.inventory?.currentQuantity ?? 0;
      const threshold = m.inventory?.refillThreshold ?? 5;
      return current <= threshold;
    }
    return true;
  });

  // Handle Refill Submit
  const handleRefillSubmit = (e) => {
    e.preventDefault();
    if (!refillMed) return;
    const current = refillMed.inventory?.currentQuantity || 0;
    const newQty = current + Number(refillAmount || 0);
    const targetMedId = refillMed.medicationId || refillMed._id || refillMed.id;

    updateMedicationMutation.mutate(
      {
        medicationId: targetMedId,
        payload: {
          inventory: {
            currentQuantity: newQty,
          },
        },
      },
      {
        onSuccess: () => {
          setRefillMed(null);
        },
      }
    );
  };

  // Open Edit Modal
  const openEditModal = (med) => {
    setEditMed(med);
    setEditForm({
      doseAmount: med.inventory?.doseAmount || 1,
      refillThreshold: med.inventory?.refillThreshold || 5,
      relationToMeals: med.instructions?.relationToMeals || 'AFTER_MEALS',
      notes: med.instructions?.notes || '',
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editMed) return;
    const targetMedId = editMed.medicationId || editMed._id || editMed.id;

    updateMedicationMutation.mutate(
      {
        medicationId: targetMedId,
        payload: {
          inventory: {
            doseAmount: Number(editForm.doseAmount),
            refillThreshold: Number(editForm.refillThreshold),
          },
          instructions: {
            relationToMeals: editForm.relationToMeals,
            notes: editForm.notes,
          },
        },
      },
      {
        onSuccess: () => {
          setEditMed(null);
        },
      }
    );
  };

  // Open Notes Modal
  const openNotesModal = (med) => {
    setNotesMed(med);
    setNotesText(med.instructions?.notes || '');
  };

  // Handle Notes Submit
  const handleNotesSubmit = (e) => {
    e.preventDefault();
    if (!notesMed) return;
    const targetMedId = notesMed.medicationId || notesMed._id || notesMed.id;

    updateMedicationMutation.mutate(
      {
        medicationId: targetMedId,
        payload: {
          instructions: {
            notes: notesText,
          },
        },
      },
      {
        onSuccess: () => {
          setNotesMed(null);
        },
      }
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Back Link */}
      <div>
        <Link 
          href={`/patients/${patientId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{isAr ? 'العودة لمركز المريض' : 'Back to Patient Hub'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface flex items-center gap-3">
            <Pill className="w-8 h-8 text-primary" />
            <span>{isAr ? 'خزانة أدوية المريض' : 'Patient Medication Cabinet'}</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'تتبع المخزون، إعادة التعبئة، والتعديل والملحوظات الطبية للمريض.' : 'Manage refills, edit instructions, and take notes for the patient.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 text-xs font-semibold self-start sm:self-auto">
          {['ALL', 'ACTIVE', 'LOW_STOCK'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-primary text-on-primary shadow-xs' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'ALL' ? (isAr ? 'الكل' : 'All') :
               tab === 'ACTIVE' ? (isAr ? 'نشطة' : 'Active') :
               (isAr ? 'مخزون منخفض' : 'Low Stock')}
            </button>
          ))}
        </div>
      </div>

      {/* Medications Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-surface-container-low animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center text-red-500 font-semibold text-sm">
          {isAr ? 'تعذر تحميل أدوية المريض' : 'Failed to load patient medications'}
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl border border-outline-variant/30 p-8">
          <Pill className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-on-surface">
            {isAr ? 'لا توجد أدوية مطابقة' : 'No Medications Found'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeds.map((med) => {
            const current = med.inventory?.currentQuantity ?? 0;
            const initial = med.inventory?.initialQuantity || 30;
            const threshold = med.inventory?.refillThreshold ?? 5;
            const isLowStock = current <= threshold;
            const percent = Math.min(100, Math.max(0, Math.round((current / initial) * 100)));

            return (
              <AppCard 
                key={med._id}
                className="p-6 border border-outline-variant/30 rounded-3xl flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-on-surface text-lg leading-tight">
                          {med.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant font-medium">
                          {med.formType || 'Tablet'}
                        </p>
                      </div>
                    </div>

                    <AppBadge variant={isLowStock ? 'warning' : 'success'}>
                      {isLowStock ? (isAr ? 'مخزون منخفض' : 'Low Stock') : (isAr ? 'متوفر' : 'In Stock')}
                    </AppBadge>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="space-y-1.5 mb-4 bg-surface-container-low/60 p-3 rounded-2xl">
                    <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                      <span>{isAr ? 'المخزون المتبقي:' : 'Stock Remaining:'}</span>
                      <span>{current} / {initial}</span>
                    </div>
                    <AppProgressBar value={percent} className="h-2" />
                  </div>

                  {/* Instructions & Dose Times */}
                  <div className="space-y-2 text-xs text-on-surface-variant">
                    {med.instructions?.relationToMeals && (
                      <div className="flex items-center justify-between">
                        <span>{isAr ? 'علاقة بالوجبات:' : 'Relation to Meals:'}</span>
                        <span className="font-semibold text-on-surface">{med.instructions.relationToMeals}</span>
                      </div>
                    )}

                    {med.schedule?.timesOfDay && (
                      <div className="flex items-center justify-between">
                        <span>{isAr ? 'أوقات الجرعات:' : 'Scheduled Times:'}</span>
                        <span className="font-semibold text-primary">{med.schedule.timesOfDay.join(', ')}</span>
                      </div>
                    )}

                    {med.instructions?.notes && (
                      <div className="mt-2 p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-[11px] font-semibold">
                        <span className="font-bold block mb-0.5">{isAr ? 'ملاحظات:' : 'Notes:'}</span>
                        {med.instructions.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Fill, Edit, Take Notes */}
                <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between gap-2 text-xs font-bold">
                  <button
                    onClick={() => setRefillMed(med)}
                    className="flex-1 py-2 px-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إعادة التعبئة' : 'Refill'}</span>
                  </button>

                  <button
                    onClick={() => openEditModal(med)}
                    className="py-2 px-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center gap-1 transition-colors cursor-pointer border border-outline-variant/30"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? 'تعديل' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => openNotesModal(med)}
                    className="py-2 px-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container-high text-on-surface flex items-center justify-center gap-1 transition-colors cursor-pointer border border-outline-variant/30"
                  >
                    <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'ملاحظات' : 'Notes'}</span>
                  </button>
                </div>
              </AppCard>
            );
          })}
        </div>
      )}

      {/* 1. REFILL MODAL */}
      {refillMed && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl p-6 max-w-md w-full border border-outline-variant/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-teal-600" />
                <span>{isAr ? `إعادة تعبئة مخزون ${refillMed.name}` : `Refill Stock: ${refillMed.name}`}</span>
              </h3>
              <button onClick={() => setRefillMed(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  {isAr ? 'الكمية المضافة للمخزون (قرص/وحدة)' : 'Quantity to Add (Units/Tablets)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-outline-variant/30 bg-surface text-on-surface text-sm font-semibold focus:outline-hidden focus:border-primary"
                />
              </div>

              <p className="text-xs text-on-surface-variant font-medium">
                {isAr 
                  ? `المخزون الحالي: ${refillMed.inventory?.currentQuantity || 0} ← بعد الإضافة: ${(refillMed.inventory?.currentQuantity || 0) + Number(refillAmount || 0)}`
                  : `Current Stock: ${refillMed.inventory?.currentQuantity || 0} → New Total: ${(refillMed.inventory?.currentQuantity || 0) + Number(refillAmount || 0)}`}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateMedicationMutation.isPending}
                  className="flex-1 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'تأكيد التعبئة' : 'Confirm Refill'}
                </button>
                <button
                  type="button"
                  onClick={() => setRefillMed(null)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT MEDICATION MODAL */}
      {editMed && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl p-6 max-w-lg w-full border border-outline-variant/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                <span>{isAr ? `تعديل تفاصيل ${editMed.name}` : `Edit Details: ${editMed.name}`}</span>
              </h3>
              <button onClick={() => setEditMed(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1">{isAr ? 'حجم الجرعة' : 'Dose Amount'}</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.doseAmount}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, doseAmount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant mb-1">{isAr ? 'حد التنبيه للمخزون' : 'Refill Threshold'}</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.refillThreshold}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, refillThreshold: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">{isAr ? 'العلاقة بالوجبات' : 'Relation to Meals'}</label>
                <select
                  value={editForm.relationToMeals}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, relationToMeals: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface text-on-surface font-semibold"
                >
                  <option value="BEFORE_MEALS">{isAr ? 'قبل الوجبة' : 'Before Meals'}</option>
                  <option value="AFTER_MEALS">{isAr ? 'بعد الوجبة' : 'After Meals'}</option>
                  <option value="WITH_FOOD">{isAr ? 'مع الطعام' : 'With Food'}</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant mb-1">{isAr ? 'ملاحظات وتوجيهات الجرعة' : 'Notes & Dosage Instructions'}</label>
                <textarea
                  rows="3"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface text-on-surface"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateMedicationMutation.isPending}
                  className="flex-1 py-2.5 rounded-2xl bg-primary text-on-primary font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMed(null)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TAKE NOTES MODAL */}
      {notesMed && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl p-6 max-w-md w-full border border-outline-variant/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                <span>{isAr ? `ملاحظات دواء ${notesMed.name}` : `Medication Notes: ${notesMed.name}`}</span>
              </h3>
              <button onClick={() => setNotesMed(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNotesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {isAr ? 'ملاحظات مقدم الرعاية للدواء' : 'Caregiver Notes & Clinical Instructions'}
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder={isAr ? 'أدخل ملاحظات خاصة بالجرعة أو الآثار الجانبية...' : 'Add special instructions or side effect notes...'}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-outline-variant/30 bg-surface text-on-surface text-xs font-semibold focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateMedicationMutation.isPending}
                  className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isAr ? 'حفظ الملاحظة' : 'Save Notes'}
                </button>
                <button
                  type="button"
                  onClick={() => setNotesMed(null)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaregiverPatientMedicationsComponent;
