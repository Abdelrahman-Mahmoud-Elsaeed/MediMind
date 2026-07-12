"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import PatientProfile from "./PatientProfile";
import CaregiverProfile from "./CaregiverProfile";
import AdminProfile from "./AdminProfile";

export default function ProfilePage() {
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

  if (user?.role === "ADMIN") {
    return <AdminProfile />;
  }

  if (user?.role === "CAREGIVER") {
    return <CaregiverProfile />;
  }

  // Default to Patient
  return <PatientProfile />;
}
