'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import Logo from "../../../assets/logo.png";

export default function RegistrationCaregiverComponent() {
  const router = useRouter();
  const { registrationData, register, loading, error, clearRegistrationData } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    // If no data from step 1, redirect back
    if (!registrationData || !registrationData.email) {
      router.push('/auth/register');
    }
  }, [registrationData, router]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setValidationError(null);

    // Validate
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setValidationError("All profile fields are required.");
      return;
    }

    try {
      const payload = {
        ...registrationData,
        ...formData,
        role: 'CAREGIVER'
      };

      const resultAction = await register(payload);
      if (resultAction.type === 'auth/register/fulfilled') {
        clearRegistrationData();
        router.push('/dashboard');
      }
    } catch (err) {
      // Handled by Redux
    }
  };

  const handleBack = () => {
    router.push('/auth/register');
  };

  if (!registrationData) return null;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      <header className="w-full flex justify-center py-6 md:py-8 z-10 relative">
        <Image 
          alt="MediMind Logo" 
          className="h-12 w-auto" 
          width={48}
          height={48}
          src={Logo} 
          priority
        />
      </header>

      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full relative z-10">
        <div className="w-full max-w-[480px] bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl p-6 md:p-10 backdrop-blur-md relative overflow-hidden">
          
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="mb-8 text-center">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Step 2 of 2</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Profile Details</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-full bg-primary rounded-full"></div>
              </div>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-fixed-dim tracking-tight mb-2">Complete Your Profile</h1>
            
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-surface-variant/50 rounded-full border border-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
              <span className="font-label-sm text-label-sm text-on-surface">Registering as Caregiver</span>
            </div>
          </div>
          
          {error && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="firstName">First Name</label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">person</span>
                  </div>
                  <input className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="firstName" placeholder="Enter your first name" required type="text" value={formData.firstName} onChange={handleChange} />
                </div>
              </div>
              
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="lastName">Last Name</label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">person</span>
                  </div>
                  <input className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="lastName" placeholder="Enter your last name" required type="text" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
              
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="phone">Phone Number</label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">call</span>
                  </div>
                  <input className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="phone" placeholder="(555) 000-0000" required type="tel" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <button disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all disabled:opacity-50" type="submit">
                {loading ? 'Registering...' : 'Complete Registration'}
                {!loading && <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>}
              </button>
              <div className="text-center mt-4">
                <button onClick={handleBack} className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors" type="button">
                  Back to Step 1
                </button>
              </div>
              <p className="mt-4 text-center font-body-md text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">lock</span> Your data is securely encrypted
              </p>
            </div>
          </form>
        </div>
      </main>
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] transform translate-x-[-20%] translate-y-[20%]"></div>
      </div>
    </div>
  );
}
