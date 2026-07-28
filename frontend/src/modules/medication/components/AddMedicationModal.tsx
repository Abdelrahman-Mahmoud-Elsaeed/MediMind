'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Medication, MedicationStatus } from '../types/medication.types';

// Zod Validation Schema matching backend DTO with clean placeholders
const addMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  formType: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'DROP', 'CREAM', 'OTHER']),
  isChronic: z.boolean(),
  quantity: z.number({ message: 'Quantity is required' }).int('Must be a solid whole number').min(1, 'Quantity must be at least 1'),
  doseAmount: z.number({ message: 'Dose amount is required' }).int('Dose amount must be a solid whole number').min(1, 'Dose amount must be at least 1'),
  refillThreshold: z.number({ message: 'Refill threshold is required' }).int('Must be a solid whole number').min(0, 'Threshold must be 0 or more'),
  relationToMeals: z.enum(['BEFORE_MEALS', 'AFTER_MEALS', 'WITH_FOOD', 'ON_EMPTY_STOMACH', 'NONE']),
  notes: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'AS_NEEDED']),
  dosesPerDay: z.number({ message: 'Doses per day is required' }).int('Doses per day must be a solid whole number').min(1).max(24),
  firstDoseTime: z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Format must be HH:MM (e.g. 08:00)'),
  startDate: z.string().min(1, 'Start date is required'),
  expirationDate: z.string().min(1, 'Expiration date is required'),
});

export type AddMedicationFormData = z.infer<typeof addMedicationSchema>;

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedication: (medication: Medication, rawDto?: any) => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  onAddMedication,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMedicationFormData>({
    resolver: zodResolver(addMedicationSchema),
    defaultValues: {
      name: '',
      formType: 'TABLET',
      isChronic: true,
      relationToMeals: 'AFTER_MEALS',
      notes: '',
      frequency: 'DAILY',
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: AddMedicationFormData) => {
    const status: MedicationStatus = 'optimal';

    const formTypeToIcon: Record<string, Medication['iconType']> = {
      TABLET: 'pill',
      CAPSULE: 'pill',
      SYRUP: 'bottle',
      INJECTION: 'kit',
      DROP: 'bottle',
      CREAM: 'kit',
      OTHER: 'kit',
    };

    const newMedication: Medication = {
      id: Date.now().toString(),
      name: data.name,
      dosage: `${data.doseAmount} tablet (${data.notes || ''})`,
      frequency: `${data.frequency.toLowerCase()} (${data.dosesPerDay}x daily)`,
      currentStock: data.quantity,
      totalStock: data.quantity,
      unit: 'UNITS',
      status,
      category: 'active',
      iconType: formTypeToIcon[data.formType] || 'pill',
    };

    // Pass structured DTO matching backend JSON schema
    const rawDto = {
      name: data.name,
      formType: data.formType,
      isChronic: data.isChronic,
      inventory: {
        initialQuantity: Number(data.quantity),
        currentQuantity: Number(data.quantity),
        doseAmount: Number(data.doseAmount),
        refillThreshold: Number(data.refillThreshold),
      },
      instructions: {
        relationToMeals: data.relationToMeals,
        notes: data.notes || '',
      },
      schedule: {
        frequency: data.frequency,
        dosesPerDay: Number(data.dosesPerDay),
        firstDoseTime: data.firstDoseTime,
        startDate: new Date(data.startDate).toISOString(),
      },
      expirationDate: new Date(data.expirationDate).toISOString(),
    };

    onAddMedication(newMedication, rawDto);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[28px] p-7 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Add New Medication
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Enter medication details with clear placeholders & solid numbers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Medication Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Medication Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg"
                  {...register('name')}
                  className={`w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none transition-all ${
                    errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#006C4E]'
                  }`}
                />
                {errors.name && <p className="text-xs font-bold text-rose-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Form Type & Chronic Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Form Type
                  </label>
                  <select
                    {...register('formType')}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#006C4E] focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="TABLET">Tablet</option>
                    <option value="CAPSULE">Capsule</option>
                    <option value="SYRUP">Syrup</option>
                    <option value="INJECTION">Injection</option>
                    <option value="DROP">Drop</option>
                    <option value="CREAM">Cream</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isChronic"
                    {...register('isChronic')}
                    className="w-5 h-5 rounded-lg text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isChronic" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Chronic Medication (Long-term)
                  </label>
                </div>
              </div>

              {/* Inventory: Single Quantity Field, Dose Amount, Refill Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Quantity (Units)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="e.g. 60"
                    {...register('quantity', { valueAsNumber: true })}
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold ${
                      errors.quantity ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Dose Amount
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="e.g. 1"
                    {...register('doseAmount', { valueAsNumber: true })}
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold ${
                      errors.doseAmount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.doseAmount && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.doseAmount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Refill Threshold
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 10"
                    {...register('refillThreshold', { valueAsNumber: true })}
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold ${
                      errors.refillThreshold ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.refillThreshold && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.refillThreshold.message}</p>
                  )}
                </div>
              </div>

              {/* Instructions: Relation to Meals & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Relation To Meals
                  </label>
                  <select
                    {...register('relationToMeals')}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#006C4E] focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="AFTER_MEALS">After Meals</option>
                    <option value="BEFORE_MEALS">Before Meals</option>
                    <option value="WITH_FOOD">With Food</option>
                    <option value="ON_EMPTY_STOMACH">On Empty Stomach</option>
                    <option value="NONE">None / No Preference</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Instructions / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Take after meals"
                    {...register('notes')}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#006C4E] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Schedule: Frequency, Doses Per Day, First Dose Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Frequency
                  </label>
                  <select
                    {...register('frequency')}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="AS_NEEDED">As Needed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Doses Per Day
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="24"
                    placeholder="e.g. 2"
                    {...register('dosesPerDay', { valueAsNumber: true })}
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold ${
                      errors.dosesPerDay ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.dosesPerDay && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.dosesPerDay.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    First Dose Time (HH:MM)
                  </label>
                  <input
                    type="text"
                    placeholder="08:00"
                    {...register('firstDoseTime')}
                    className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-semibold ${
                      errors.firstDoseTime ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {errors.firstDoseTime && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">{errors.firstDoseTime.message}</p>
                  )}
                </div>
              </div>

              {/* Start Date & Expiration Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    {...register('expirationDate')}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Footer Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#006C4E] hover:bg-[#00523B] text-white px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medication</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
