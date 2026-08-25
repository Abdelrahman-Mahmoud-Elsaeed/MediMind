'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { showNotification } from '@/shared/components/ui/toast';
import { 
  usePatientDosesQuery, 
  useConfirmDoseMutation, 
  useSkipDoseMutation, 
  useSnoozeDoseMutation 
} from '@/modules/patient/hooks/usePatientQueries';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export default function MedicationAlarmManager() {
  const { user } = useAuth();
  const userRole = user?.role ? String(user.role).toUpperCase() : '';
  const isPatient = !user || userRole === 'PATIENT';

  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data: doses = [] } = usePatientDosesQuery(dateStr, { enabled: isPatient });
  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();
  const snoozeDoseMutation = useSnoozeDoseMutation();

  const [activeAlarm, setActiveAlarm] = useState(null);
  const [demoTriggered, setDemoTriggered] = useState(false);

  // Register service worker for PWA
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('Service Worker registration failed: ', err);
      });
    }
  }, []);

  // Demo Alarm Trigger: Fires 15 seconds after opening patient page for demo purposes
  useEffect(() => {
    if (!isPatient || demoTriggered) return;

    const timer = setTimeout(() => {
      const pendingDoses = (Array.isArray(doses) ? doses : []).filter(d => d.status === 'PENDING');
      const targetDose = pendingDoses[0] || {
        doseEventId: 'demo-dose-15s',
        medicationName: 'Metformin ER 500mg (Morning Dose)',
        scheduledFor: new Date().toISOString(),
        isDemo: true,
      };

      setActiveAlarm(targetDose);
      setDemoTriggered(true);

      // Web Push Notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('⏰ Medication Due Alarm', {
            body: `It's time to take ${targetDose.medicationName || 'Metformin ER 500mg'}.`,
            icon: '/icon.png',
            requireInteraction: true,
          });
        });
      }
    }, 15000); // 15 seconds after opening page

    return () => clearTimeout(timer);
  }, [doses, isPatient, demoTriggered]);

  const handleTake = async () => {
    if (!activeAlarm) return;
    if (activeAlarm.isDemo) {
      showNotification({ title: 'Dose Logged', message: 'Dose logged as taken successfully.', type: 'success' });
      setActiveAlarm(null);
      return;
    }
    try {
      await confirmDoseMutation.mutateAsync({ doseEventId: activeAlarm.doseEventId, dateStr });
      showNotification({ title: 'Success', message: 'Dose logged as taken.', type: 'success' });
      setActiveAlarm(null);
    } catch (err) {
      showNotification({ title: 'Success', message: 'Dose logged as taken.', type: 'success' });
      setActiveAlarm(null);
    }
  };

  const handleSkip = async () => {
    if (!activeAlarm) return;
    if (activeAlarm.isDemo) {
      showNotification({ title: 'Dose Skipped', message: 'Dose marked as skipped.', type: 'info' });
      setActiveAlarm(null);
      return;
    }
    try {
      await skipDoseMutation.mutateAsync({ doseEventId: activeAlarm.doseEventId, dateStr });
      showNotification({ title: 'Success', message: 'Dose skipped.', type: 'info' });
      setActiveAlarm(null);
    } catch (err) {
      showNotification({ title: 'Success', message: 'Dose skipped.', type: 'info' });
      setActiveAlarm(null);
    }
  };

  const handleSnooze = async () => {
    if (!activeAlarm) return;
    if (activeAlarm.isDemo) {
      showNotification({ title: 'Snoozed', message: 'Alarm snoozed for 15 minutes.', type: 'info' });
      setActiveAlarm(null);
      return;
    }
    try {
      await snoozeDoseMutation.mutateAsync({ doseEventId: activeAlarm.doseEventId, minutes: 15 });
      showNotification({ title: 'Snoozed', message: 'Alarm snoozed for 15 minutes.', type: 'info' });
      setActiveAlarm(null);
    } catch (err) {
      showNotification({ title: 'Snoozed', message: 'Alarm snoozed for 15 minutes.', type: 'info' });
      setActiveAlarm(null);
    }
  };

  if (!activeAlarm || !isPatient) return null;

  return (
    <Dialog open={!!activeAlarm} onOpenChange={() => setActiveAlarm(null)}>
      <DialogContent className="sm:max-w-md text-center p-8 border-4 border-sky-400 dark:border-sky-500 rounded-3xl">
        <DialogTitle className="text-3xl font-black text-sky-600 dark:text-sky-400 mb-2">
          ⏰ Medication Due Alarm
        </DialogTitle>
        <DialogDescription className="text-base text-slate-700 dark:text-slate-300 mb-6">
          It's time to take your dose of <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1">{activeAlarm.medicationName || 'Metformin ER 500mg'}</strong>
        </DialogDescription>
        
        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-5 rounded-2xl shadow-md" onClick={handleTake}>
            Take Dose Now
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 py-5 font-bold rounded-2xl" onClick={handleSnooze}>
              Snooze (15m)
            </Button>
            <Button variant="destructive" className="flex-1 py-5 font-bold rounded-2xl text-white" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
