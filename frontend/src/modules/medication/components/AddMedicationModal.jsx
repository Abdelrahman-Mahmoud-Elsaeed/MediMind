'use client';
import React from 'react';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppDialog } from '@/shared/components/ui/AppDialog';
import { AppButton } from '@/shared/components/ui/AppButton';
import { AppInput } from '@/shared/components/ui/AppInput';
import { AppSelect } from '@/shared/components/ui/AppSelect';
import { Controller } from 'react-hook-form';
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
export const AddMedicationModal = ({ isOpen, onClose, onAddMedication, }) => {
    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
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
    const onSubmit = (data) => {
        const status = 'optimal';
        const formTypeToIcon = {
            TABLET: 'pill',
            CAPSULE: 'pill',
            SYRUP: 'bottle',
            INJECTION: 'kit',
            DROP: 'bottle',
            CREAM: 'kit',
            OTHER: 'kit',
        };
        const newMedication = {
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
    return (<AppDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} title="Add New Medication" description="Enter medication details with clear placeholders & solid numbers." className="max-w-xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        {/* Medication Name */}
        <AppInput label="Medication Name" placeholder="e.g. Metformin 500mg" {...register('name')} error={errors.name?.message}/>

        {/* Form Type & Chronic Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="formType"
            control={control}
            render={({ field }) => (
              <AppSelect
                label="Form Type"
                value={field.value}
                onValueChange={field.onChange}
                options={[
                  { value: 'TABLET', label: 'Tablet' },
                  { value: 'CAPSULE', label: 'Capsule' },
                  { value: 'SYRUP', label: 'Syrup' },
                  { value: 'INJECTION', label: 'Injection' },
                  { value: 'DROP', label: 'Drop' },
                  { value: 'CREAM', label: 'Cream' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
            )}
          />

          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" id="isChronic" {...register('isChronic')} className="w-5 h-5 rounded-lg text-primary border-outline-variant focus:ring-primary cursor-pointer"/>
            <label htmlFor="isChronic" className="text-xs font-bold text-on-surface cursor-pointer">
              Chronic Medication (Long-term)
            </label>
          </div>
        </div>

        {/* Inventory Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AppInput label="Quantity (Units)" type="number" step="1" min="1" placeholder="e.g. 60" {...register('quantity', { valueAsNumber: true })} error={errors.quantity?.message}/>
          <AppInput label="Dose Amount" type="number" step="1" min="1" placeholder="e.g. 1" {...register('doseAmount', { valueAsNumber: true })} error={errors.doseAmount?.message}/>
          <AppInput label="Refill Threshold" type="number" step="1" min="0" placeholder="e.g. 10" {...register('refillThreshold', { valueAsNumber: true })} error={errors.refillThreshold?.message}/>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="relationToMeals"
            control={control}
            render={({ field }) => (
              <AppSelect
                label="Relation To Meals"
                value={field.value}
                onValueChange={field.onChange}
                options={[
                  { value: 'AFTER_MEALS', label: 'After Meals' },
                  { value: 'BEFORE_MEALS', label: 'Before Meals' },
                  { value: 'WITH_FOOD', label: 'With Food' },
                  { value: 'ON_EMPTY_STOMACH', label: 'On Empty Stomach' },
                  { value: 'NONE', label: 'None / No Preference' },
                ]}
              />
            )}
          />

          <AppInput label="Instructions / Notes" placeholder="e.g. Take after meals" {...register('notes')}/>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <AppSelect
                label="Frequency"
                value={field.value}
                onValueChange={field.onChange}
                options={[
                  { value: 'DAILY', label: 'Daily' },
                  { value: 'WEEKLY', label: 'Weekly' },
                  { value: 'AS_NEEDED', label: 'As Needed' },
                ]}
              />
            )}
          />

          <AppInput label="Doses Per Day" type="number" step="1" min="1" max="24" placeholder="e.g. 2" {...register('dosesPerDay', { valueAsNumber: true })} error={errors.dosesPerDay?.message}/>

          <AppInput label="First Dose Time" placeholder="08:00" {...register('firstDoseTime')} error={errors.firstDoseTime?.message}/>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput label="Start Date" type="date" {...register('startDate')}/>
          <AppInput label="Expiration Date" type="date" {...register('expirationDate')}/>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
          <AppButton type="button" variant="outline" onClick={handleClose}>
            Cancel
          </AppButton>
          <AppButton type="submit" isLoading={isSubmitting} leftIcon={<Plus className="w-4 h-4"/>}>
            Add Medication
          </AppButton>
        </div>
      </form>
    </AppDialog>);
};
export default AddMedicationModal;
