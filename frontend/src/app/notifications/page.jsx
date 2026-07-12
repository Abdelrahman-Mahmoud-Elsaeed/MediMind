"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import PatientNotifications from "./PatientNotifications";
import CaregiverNotifications from "./CaregiverNotifications";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user?.role === "CAREGIVER") {
    return <CaregiverNotifications />;
  }

  // Default to Patient
  return <PatientNotifications />;
}
