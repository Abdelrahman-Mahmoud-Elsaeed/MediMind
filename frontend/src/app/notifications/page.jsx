"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import PatientNotifications from "./PatientNotifications";
import CaregiverNotifications from "./CaregiverNotifications";
export default function NotificationsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isAuthLoading } = useAuth();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (mounted && !isAuthLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isAuthLoading, router, mounted]);
    if (!mounted || isAuthLoading) {
        return <div className="p-8 text-slate-500 font-semibold" suppressHydrationWarning>Loading notifications...</div>;
    }
    if (!isAuthenticated) {
        return null;
    }
    if (['FAMILY_CAREGIVER', 'PROFESSIONAL_CAREGIVER', 'CAREGIVER'].includes(user?.role)) {
        return <CaregiverNotifications />;
    }
    // Default to Patient
    return <PatientNotifications />;
}
