"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import PatientProfile from "./PatientProfile";
import CaregiverProfile from "./CaregiverProfile";
import PharmacistProfile from "./PharmacistProfile";
import AdminProfile from "./AdminProfile";

export default function ProfilePage() {
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
        return <div className="p-8 text-slate-500 font-semibold" suppressHydrationWarning>Loading profile...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    if (user?.role === "ADMIN") {
        return <AdminProfile />;
    }
    if (user?.role === "PHARMACIST") {
        return <PharmacistProfile />;
    }
    if (user?.role === "CAREGIVER" || user?.role === "FAMILY_CAREGIVER" || user?.role === "PROFESSIONAL_CAREGIVER") {
        return <CaregiverProfile />;
    }
    // Default to Patient
    return <PatientProfile />;
}
