"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import PatientNotifications from "./PatientNotifications";
import CaregiverNotifications from "./CaregiverNotifications";
export default function NotificationsPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (mounted && !loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router, mounted]);
    if (!mounted || loading) {
        return <div className="p-8">Loading...</div>;
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
