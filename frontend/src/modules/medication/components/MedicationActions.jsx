import React from 'react';
import { Edit3, Clock, ShoppingCart, RefreshCw, Trash2 } from 'lucide-react';
export const MedicationActions = ({ onEdit, onSchedule, onRefill, onDelete, isUrgent = false, }) => {
    return (<div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 gap-2">
      <button type="button" onClick={onRefill} className={`flex-1 py-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs ${isUrgent
            ? 'bg-[#C5221F] hover:bg-rose-700 text-white'
            : 'bg-[#006C4E] hover:bg-[#00523B] text-white'}`} title={isUrgent ? 'Urgent Refill Order' : 'Auto-Renew / Refill'}>
        {isUrgent ? <ShoppingCart className="w-4 h-4"/> : <RefreshCw className="w-4 h-4"/>}
      </button>

      <button type="button" onClick={onSchedule} className="flex-1 py-2.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer" title="Schedule & History">
        <Clock className="w-4 h-4 text-slate-600 dark:text-slate-300"/>
      </button>

      <button type="button" onClick={onEdit} className="flex-1 py-2.5 rounded-xl bg-[#F0F4F8] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer" title="Edit Medication">
        <Edit3 className="w-4 h-4 text-slate-600 dark:text-slate-300"/>
      </button>

      <button type="button" onClick={onDelete} className="flex-1 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-all cursor-pointer border border-rose-200/50 dark:border-rose-900/40" title="Delete Medication">
        <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400"/>
      </button>
    </div>);
};
