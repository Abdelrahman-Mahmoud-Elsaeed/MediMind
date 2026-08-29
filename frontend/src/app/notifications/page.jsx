"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import UnifiedNotificationsComponent from "@/modules/notifications/components/UnifiedNotificationsComponent";

export default function NotificationsPage() {
    const router = useRouter();
    const { isAuthenticated, isAuthLoading } = useAuth();
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
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <UnifiedNotificationsComponent />;
}
