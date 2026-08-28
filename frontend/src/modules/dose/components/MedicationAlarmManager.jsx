'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { showNotification } from '@/shared/components/ui/toast';
import { Volume2, VolumeX } from 'lucide-react';
import {
  usePatientDosesQuery,
  useConfirmDoseMutation,
  useSkipDoseMutation,
  useSnoozeDoseMutation
} from '@/modules/patient/hooks/usePatientQueries';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useTranslation } from '@/shared/lib/i18nContext';

// Sound file path for medication alarm modal popup
const ALARM_SOUND_URL = '/sounds/alarm.wav';

let alarmAudioInstance = null;

function playAlarmSoundDirectly(isMuted = false, onPlaySuccess, onPlayError) {
  if (typeof window === 'undefined' || isMuted) return;
  try {
    if (!alarmAudioInstance) {
      alarmAudioInstance = new Audio(ALARM_SOUND_URL);
      alarmAudioInstance.loop = true;
    }
    alarmAudioInstance.currentTime = 0;
    alarmAudioInstance.volume = 1.0;
    const playPromise = alarmAudioInstance.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (onPlaySuccess) onPlaySuccess();
        })
        .catch(() => {
          if (onPlayError) onPlayError();
        });
    }
  } catch (err) {
    if (onPlayError) onPlayError();
  }
}

function stopAlarmSoundDirectly(onStopped) {
  if (alarmAudioInstance) {
    try {
      alarmAudioInstance.pause();
      alarmAudioInstance.currentTime = 0;
    } catch (e) {}
  }
  if (onStopped) onStopped();
}

export default function MedicationAlarmManager() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === 'ar';
  const userRole = user?.role ? String(user.role).toUpperCase() : '';
  const isPatient = !user || userRole === 'PATIENT';

  const dateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const { data: doses = [] } = usePatientDosesQuery(dateStr, { enabled: isPatient });
  const confirmDoseMutation = useConfirmDoseMutation();
  const skipDoseMutation = useSkipDoseMutation();
  const snoozeDoseMutation = useSnoozeDoseMutation();

  const [activeAlarm, setActiveAlarm] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const demoFiredRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to manually or automatically trigger a demo alarm
  const triggerDemo = useCallback(() => {
    const targetDose = {
      doseEventId: 'demo-dose-5s',
      medicationName: isAr ? 'دواء تجريبي ٥٠٠ ملغ (منبه تجريبي)' : 'Demo Medication 500mg (Test Alarm)',
      scheduledFor: new Date().toISOString(),
      isDemo: true,
    };

    setActiveAlarm(targetDose);

    // Web Push Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(isAr ? 'تنبيه موعد الدواء' : 'Medication Due Alarm', {
          body: isAr ? `حان موعد تناول ${targetDose.medicationName}.` : `It's time to take ${targetDose.medicationName}.`,
          icon: '/images/logo.png',
          requireInteraction: true,
        });
      });
    }
  }, [isAr]);

  // Expose global helper window.triggerDemoAlarm() for instant testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.triggerDemoAlarm = triggerDemo;
    }
  }, [triggerDemo]);

  // Register service worker & request Notification permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.error('Service Worker registration failed: ', err);
        });
      }
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Demo Alarm Trigger: Fires 2 seconds after opening patient page for demo purposes
  useEffect(() => {
    if (!isPatient || demoFiredRef.current) return;

    const timer = setTimeout(() => {
      if (demoFiredRef.current) return;
      demoFiredRef.current = true;
      triggerDemo();
    }, 2000); // 2 seconds after page load

    return () => clearTimeout(timer);
  }, [isPatient, triggerDemo]);

  // Pre-unlock audio domain permission on first user interaction anywhere on page
  useEffect(() => {
    const handleFirstGesture = () => {
      try {
        if (!alarmAudioInstance && typeof window !== 'undefined') {
          alarmAudioInstance = new Audio(ALARM_SOUND_URL);
          alarmAudioInstance.loop = true;
        }
        if (alarmAudioInstance) {
          alarmAudioInstance.volume = 0.001;
          const p = alarmAudioInstance.play();
          if (p !== undefined) {
            p.then(() => {
              alarmAudioInstance.pause();
              alarmAudioInstance.currentTime = 0;
              alarmAudioInstance.volume = 1.0;
              setAudioPlaying(true);
            }).catch(() => {});
          }
        }
      } catch (e) {}

      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
    window.addEventListener('scroll', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
    };
  }, []);

  // Trigger Sound immediately whenever activeAlarm UI opens
  useEffect(() => {
    if (!activeAlarm || isMuted) return;

    playAlarmSoundDirectly(
      isMuted,
      () => setAudioPlaying(true),
      () => setAudioPlaying(false)
    );

    return () => {
      stopAlarmSoundDirectly(() => setAudioPlaying(false));
    };
  }, [activeAlarm, isMuted]);

  const handleTake = async () => {
    stopAlarmSoundDirectly(() => setAudioPlaying(false));
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
    stopAlarmSoundDirectly(() => setAudioPlaying(false));
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
    stopAlarmSoundDirectly(() => setAudioPlaying(false));
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

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (isMuted) {
      setIsMuted(false);
      playAlarmSoundDirectly(
        false,
        () => setAudioPlaying(true),
        () => setAudioPlaying(false)
      );
    } else {
      setIsMuted(true);
      stopAlarmSoundDirectly(() => setAudioPlaying(false));
    }
  };

  if (!mounted || !isPatient || !activeAlarm) return null;

  return (
    <div
      onClick={() => {
        if (!isMuted) {
          playAlarmSoundDirectly(
            isMuted,
            () => setAudioPlaying(true),
            () => setAudioPlaying(false)
          );
        }
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 border-4 border-sky-400 dark:border-sky-500 rounded-3xl p-8 text-center shadow-2xl relative space-y-6 cursor-default"
      >
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          title={isMuted ? (isAr ? 'تشغيل الصوت' : 'Unmute Sound') : (isAr ? 'كتم الصوت' : 'Mute Sound')}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5 text-teal-600 animate-pulse" />}
        </button>

        {/* Title Header */}
        <h2 className="text-3xl font-black text-sky-600 dark:text-sky-400 mb-2">
          ⏰ {isAr ? 'تنبيه موعد الدواء' : 'Medication Due Alarm'}
        </h2>

        {/* Subtitle Description */}
        <p className="text-base text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
          {isAr ? 'حان الآن موعد تناول الجرعة المحددة لـ' : "It's time to take your dose of"}{' '}
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1.5 leading-snug">
            {activeAlarm?.medicationName || 'Metformin ER 500mg'}
          </strong>
        </p>

        {/* Start Sound Button Prompt if Browser Autoplay is Pending */}
        {!audioPlaying && !isMuted && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              playAlarmSoundDirectly(
                isMuted,
                () => setAudioPlaying(true),
                () => setAudioPlaying(false)
              );
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 animate-bounce transition-all"
          >
            <Volume2 className="w-5 h-5" />
            {isAr ? 'اضغط هنا لتشغيل صوت المنبه 🔔' : 'Tap to Start Alarm Sound 🔔'}
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-5 rounded-2xl shadow-md" onClick={handleTake}>
            {isAr ? 'تناول الجرعة الآن' : 'Take Dose Now'}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 py-5 font-bold rounded-2xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300" onClick={handleSnooze}>
              {isAr ? 'تأجيل (١٥د)' : 'Snooze (15m)'}
            </Button>
            <Button variant="destructive" className="flex-1 py-5 font-bold rounded-2xl text-white" onClick={handleSkip}>
              {isAr ? 'تخطي' : 'Skip'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
