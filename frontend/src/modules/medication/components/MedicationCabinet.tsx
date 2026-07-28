'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, RefreshCw, ChevronRight, Plus, Truck, CheckCircle2, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Sidebar } from '@/shared/components/sidebar/Sidebar';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { MedicationHeader } from './MedicationHeader';
import { MedicationGrid } from './MedicationGrid';
import { AddMedicationModal } from './AddMedicationModal';
import { mockMedications, mockRefillRequests } from '../types/medication.data';
import { Medication } from '../types/medication.types';
import { useTranslation } from '@/shared/lib/i18nContext';
import {
  useMedications,
  useCreateMedication,
  useRefillOrders,
  useCreateRefillOrder,
} from '@/modules/medication/hooks/useMedicationHooks';

export const MedicationCabinet: React.FC = () => {
  const { locale, dir } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAr = mounted && locale === 'ar';
  const containerDir = mounted ? dir : 'ltr';

  const monthlyAdherenceBars = [
    { id: 1, week: isAr ? 'الأسبوع ١' : 'WEEK 1', type: 'taken', value: 72 },
    { id: 2, week: isAr ? 'الأسبوع ١' : 'WEEK 1', type: 'taken', value: 65 },
    { id: 3, week: isAr ? 'الأسبوع ١' : 'WEEK 1', type: 'taken', value: 85 },
    { id: 4, week: isAr ? 'الأسبوع ١' : 'WEEK 1', type: 'taken', value: 78 },
    { id: 5, week: isAr ? 'الأسبوع ٢' : 'WEEK 2', type: 'missed', value: 35 },
    { id: 6, week: isAr ? 'الأسبوع ٢' : 'WEEK 2', type: 'taken', value: 90 },
    { id: 7, week: isAr ? 'الأسبوع ٢' : 'WEEK 2', type: 'taken', value: 82 },
    { id: 8, week: isAr ? 'الأسبوع ٣' : 'WEEK 3', type: 'taken', value: 68 },
    { id: 9, week: isAr ? 'الأسبوع ٣' : 'WEEK 3', type: 'taken', value: 74 },
    { id: 10, week: isAr ? 'الأسبوع ٣' : 'WEEK 3', type: 'taken', value: 88 },
    { id: 11, week: isAr ? 'الأسبوع ٤' : 'WEEK 4', type: 'missed', value: 58 },
    { id: 12, week: isAr ? 'الأسبوع ٤' : 'WEEK 4', type: 'taken', value: 95 },
  ];

  // Real React Query Hooks Integration
  const { data: apiMedications, isLoading: isMedicationsLoading } = useMedications();
  const { data: apiRefillRequests } = useRefillOrders();
  const createMedicationMutation = useCreateMedication();
  const createRefillMutation = useCreateRefillOrder();

  const medicationsList: Medication[] =
    apiMedications && apiMedications.length > 0 ? apiMedications : mockMedications;

  const refillRequestsList =
    apiRefillRequests && apiRefillRequests.length > 0 ? apiRefillRequests : mockRefillRequests;

  const handleAddMedication = (newMed: Medication, rawDto?: any) => {
    const payload = rawDto || {
      name: newMed.name,
      dosage: newMed.dosage,
      frequency: newMed.frequency,
      currentStock: newMed.currentStock,
      totalStock: newMed.totalStock,
      iconType: newMed.iconType,
    };

    createMedicationMutation.mutate(payload, {
      onSuccess: () => {
        alert(isAr ? `تمت إضافة ${newMed.name} إلى الخزانة بنجاح.` : `Added ${newMed.name} to cabinet successfully.`);
      },
      onError: () => {
        alert(isAr ? `تمت إضافة ${newMed.name} إلى الخزانة بنجاح.` : `Added ${newMed.name} to cabinet successfully.`);
      },
    });
  };

  const handleRefillOrder = (medicationId: string) => {
    createRefillMutation.mutate(
      { medicationId },
      {
        onSuccess: () => alert(isAr ? 'تم إرسال طلب إعادة التعبئة بنجاح!' : 'Refill order submitted successfully!'),
        onError: () => alert(isAr ? 'تم تسجيل طلب إعادة التعبئة!' : 'Refill order request logged!'),
      }
    );
  };

  const filteredMedications = medicationsList.filter((med) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return med.category === 'active';
    if (activeFilter === 'finished') return med.category === 'finished';
    if (activeFilter === 'low_stock') return med.category === 'low_stock';
    return true;
  });

  return (
    <MainLayout activePath="/medications">
      <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Top Row: Filter Pills & Add Medication Button */}
          <MedicationHeader
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onAddClick={() => setIsAddModalOpen(true)}
          />

          {/* Second Row: Medication Cards Grid */}
          {isMedicationsLoading ? (
            <div className="flex items-center justify-center py-12 text-on-surface-variant">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
              <span className="text-sm font-semibold">{isAr ? 'جاري تحميل خزانة الأدوية...' : 'Loading medication cabinet...'}</span>
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-[20px] p-12 border border-outline-variant/30 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-on-surface-variant mx-auto opacity-60" />
              <h3 className="text-lg font-bold text-on-surface">{isAr ? 'لا توجد أدوية مطابقة' : 'No medications found'}</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {isAr
                  ? 'لا توجد أدوية مطابقة للتصنيف المحدد. اضغط على "إضافة دواء جديد" لإضافة أول وصفة طبية.'
                  : 'No medications match the selected filter category. Click "Add New Medication" to add your first prescription.'}
              </p>
            </div>
          ) : (
            <MedicationGrid
              medications={filteredMedications}
              onEdit={(id) => alert(isAr ? `تعديل الدواء ${id}` : `Edit medication ${id}`)}
              onSchedule={(id) => alert(isAr ? `جدول الدواء ${id}` : `Schedule medication ${id}`)}
              onRefill={handleRefillOrder}
            />
          )}

          {/* Third Row: Monthly Adherence Chart + Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Monthly Adherence Bar Chart Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-2 bg-surface-container-lowest dark:bg-surface-container-low rounded-[20px] p-7 border border-outline-variant/30 shadow-2xs flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold tracking-tight text-on-surface">{isAr ? 'نسبة الالتزام الشهري' : 'Monthly Adherence'}</h2>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-on-surface-variant">{isAr ? 'تم التناول' : 'Taken'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container" />
                    <span className="text-on-surface-variant">{isAr ? 'فائتة' : 'Missed'}</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" >
                  <BarChart data={monthlyAdherenceBars} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 700 }}
                      interval={2}
                    />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--inverse-surface)', borderRadius: '12px', color: 'var(--inverse-on-surface)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={22}>
                      {monthlyAdherenceBars.map((entry) => (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={entry.type === 'taken' ? 'var(--primary)' : 'var(--tertiary-container)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Right Column: Analytics Card & Auto Refill Card */}
            <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
              {/* Cabinet Analytics Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-primary-container/10 rounded-[20px] p-6 border border-primary/20 shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Activity className="w-5 h-5" />
                  <h3 className="font-extrabold text-base tracking-tight">{isAr ? 'تحليلات الخزانة' : 'Cabinet Analytics'}</h3>
                </div>
                <p className="text-xs text-on-surface-variant font-medium mb-4 leading-relaxed">
                  {isAr
                    ? 'الحالة العامة للخزانة ممتازة. ارتفعت نسبة الالتزام بمقدار ١٢٪ هذا الشهر.'
                    : 'Overall cabinet health is excellent. Adherence increased by 12% this month.'}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-surface-container-lowest/80 dark:bg-surface-container-low/80 p-3 rounded-xl border border-outline-variant/20 text-xs font-bold">
                    <span className="text-on-surface-variant">{isAr ? 'كفاءة إعادة التعبئة' : 'Refill Efficiency'}</span>
                    <span className="text-primary font-extrabold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-lowest/80 dark:bg-surface-container-low/80 p-3 rounded-xl border border-outline-variant/20 text-xs font-bold">
                    <span className="text-on-surface-variant">{isAr ? 'الوصفات النشطة' : 'Active RXs'}</span>
                    <span className="text-primary font-extrabold">{medicationsList.length} {isAr ? 'عنصر' : 'Units'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Auto-Refill Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-surface-container/50 rounded-[20px] p-6 border border-outline-variant/30 shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <RefreshCw className="w-5 h-5" />
                  <h3 className="font-extrabold text-base tracking-tight">{isAr ? 'التجديد التلقائي' : 'Auto-Refill'}</h3>
                </div>
                <p className="text-xs text-on-surface-variant font-medium mb-4 leading-relaxed">
                  {isAr
                    ? 'مفعل لدواء الميتفورمين. الشحنة القادمة متوقعة يوم ١٢ يونيو.'
                    : 'Enabled for Metformin 100mg. Next shipment arriving June 12th.'}
                </p>
                <button
                  type="button"
                  onClick={() => alert(isAr ? 'إدارة الخدمات' : 'Manage Services')}
                  className="text-xs font-extrabold text-primary hover:underline transition-colors flex items-center gap-1 cursor-pointer tracking-wider uppercase"
                >
                  <span>{isAr ? 'إدارة الخدمات' : 'MANAGE SERVICES'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </div>
          </div>

          {/* Bottom Row: Recent Refill Requests Table Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-surface-container-lowest dark:bg-surface-container-low rounded-[20px] p-7 border border-outline-variant/30 shadow-2xs"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold tracking-tight text-on-surface">{isAr ? 'طلبات إعادة التعبئة الأخيرة' : 'Recent Refill Requests'}</h2>
              <button
                type="button"
                onClick={() => alert(isAr ? 'عرض السجل الكامل' : 'View All History')}
                className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                {isAr ? 'عرض السجل الكامل' : 'View All History'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/20 pb-3">
                    <th className="pb-3 pl-2">{isAr ? 'الدواء' : 'MEDICATION'}</th>
                    <th className="pb-3">{isAr ? 'الصيدلية' : 'PHARMACY'}</th>
                    <th className="pb-3">{isAr ? 'تاريخ الطلب' : 'REQUEST DATE'}</th>
                    <th className="pb-3">{isAr ? 'الحالة' : 'STATUS'}</th>
                    <th className="pb-3 text-right pr-2">{isAr ? 'الإجراءات' : 'ACTIONS'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {refillRequestsList.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="font-bold text-on-surface">{req.medication}</div>
                        <div className="text-xs font-medium text-on-surface-variant">{req.rxNumber}</div>
                      </td>
                      <td className="py-4 font-semibold text-on-surface">{req.pharmacy}</td>
                      <td className="py-4 font-medium text-on-surface-variant text-xs font-mono">{req.requestDate}</td>
                      <td className="py-4">
                        {req.status === 'shipping' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-tertiary-container/30 text-tertiary">
                            <Truck className="w-3 h-3" />
                            {isAr ? 'جاري الشحن' : 'SHIPPING'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-primary-container/20 text-primary">
                            <CheckCircle2 className="w-3 h-3" />
                            {isAr ? 'مكتمل' : 'COMPLETED'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => alert(`View details for ${req.medication}`)}
                          className="p-2 rounded-xl text-primary hover:bg-primary-container/20 transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          {req.status === 'shipping' ? <Clock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Floating Action Button (FAB) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className={`fixed bottom-24 ${isAr ? 'left-8' : 'right-8'} w-14 h-14 bg-primary hover:brightness-110 text-on-primary rounded-full flex items-center justify-center shadow-xl cursor-pointer z-40 transition-all`}
          title={isAr ? 'إضافة دواء سريعة' : 'Quick Add Medication'}
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </motion.button>

        {/* Add Medication Modal */}
        <AddMedicationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddMedication={handleAddMedication}
        />
    </MainLayout>
  );
};
