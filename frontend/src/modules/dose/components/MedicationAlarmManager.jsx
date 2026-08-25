import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { showNotification } from '@/shared/components/ui/toast';
import { 
  usePatientDosesQuery, 
  useConfirmDoseMutation, 
  useSkipDoseMutation, 
  useSnoozeDoseMutation 
} from '@/modules/patient/hooks/usePatientQueries';

export default function MedicationAlarmManager() {
  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data: doses = [] } = usePatientDosesQuery(dateStr);
  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();
  const snoozeDoseMutation = useSnoozeDoseMutation();

  const [activeAlarm, setActiveAlarm] = useState(null);
  const [notifiedIds, setNotifiedIds] = useState(new Set());

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('Service Worker registration failed: ', err);
      });
    }
  }, []);

  // Polling check for due medications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const pendingDoses = doses.filter(d => d.status === 'PENDING');
      
      for (const dose of pendingDoses) {
        const scheduledTime = new Date(dose.scheduledFor);
        if (now >= scheduledTime && !notifiedIds.has(dose.doseEventId)) {
          // Trigger alarm for this dose
          setActiveAlarm(dose);
          setNotifiedIds(prev => new Set(prev).add(dose.doseEventId));
          
          // Optionally trigger native push notification if available
          if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification('Medication Due', {
                body: `It's time for ${dose.medicationName || 'your medication'}.`,
                icon: '/icon.png',
                requireInteraction: true
              });
            });
          }
          break; // Show one alarm at a time
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [doses, notifiedIds]);

  const handleTake = async () => {
    if (!activeAlarm) return;
    try {
      await confirmDoseMutation.mutateAsync({ doseEventId: activeAlarm.doseEventId, dateStr });
      showNotification({ title: 'Success', message: 'Dose logged as taken.', type: 'success' });
      setActiveAlarm(null);
    } catch (err) {
      showNotification({ title: 'Error', message: 'Failed to log dose.', type: 'error' });
    }
  };

  const handleSkip = async () => {
    if (!activeAlarm) return;
    try {
      await skipDoseMutation.mutateAsync({ doseEventId: activeAlarm.doseEventId, dateStr });
      showNotification({ title: 'Success', message: 'Dose skipped.', type: 'info' });
      setActiveAlarm(null);
    } catch (err) {
      showNotification({ title: 'Error', message: 'Failed to skip dose.', type: 'error' });
    }
  };

  const handleSnooze = async () => {
    if (!activeAlarm) return;
    try {
      await snoozeDoseMutation.mutateAsync({ doseEventId: activeAlarm.doseEventId, minutes: 15 });
      showNotification({ title: 'Snoozed', message: 'Alarm snoozed for 15 minutes.', type: 'info' });
      
      // Remove from notified so it triggers again later
      setNotifiedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(activeAlarm.doseEventId);
        return newSet;
      });
      setActiveAlarm(null);
    } catch (err) {
      showNotification({ title: 'Error', message: 'Failed to snooze alarm.', type: 'error' });
    }
  };

  if (!activeAlarm) return null;

  return (
    <Dialog open={!!activeAlarm} onOpenChange={() => setActiveAlarm(null)}>
      <DialogContent className="sm:max-w-md text-center p-8 border-4 border-sky-400 animate-pulse-border">
        <DialogTitle className="text-3xl font-bold text-sky-600 mb-2">Medication Reminder</DialogTitle>
        <DialogDescription className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          It's time to take your dose of <strong className="text-xl text-slate-900 dark:text-white">{activeAlarm.medicationName || 'Medication'}</strong>.
        </DialogDescription>
        
        <div className="flex flex-col gap-4">
          <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6" onClick={handleTake}>
            Take Dose Now
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 py-6" onClick={handleSnooze}>
              Snooze (15m)
            </Button>
            <Button variant="destructive" className="flex-1 py-6" onClick={handleSkip}>
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
