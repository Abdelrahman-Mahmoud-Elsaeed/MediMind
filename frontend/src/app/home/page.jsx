'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import PatientHome from './PatientHome';
export default function HomePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useAuth();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (mounted && !loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, loading, router, mounted]);
    if (!mounted || loading) {
        return <div className="p-8 text-slate-500 font-semibold">Loading dashboard...</div>;
    }
    if (!isAuthenticated) {
        return null;
    }
    return <PatientHome />;
}
