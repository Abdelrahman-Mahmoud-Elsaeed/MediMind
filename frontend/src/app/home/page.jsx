"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import PatientHome from "./PatientHome";
import CaregiverHome from "./CaregiverHome";
import AdminHome from "./AdminHome";

export default function HomePage() {
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
    return <AdminHome />;
  }

  if (user?.role === "CAREGIVER") {
    return <CaregiverHome />;
  }

  // Default to Patient
  return <PatientHome />;
}
