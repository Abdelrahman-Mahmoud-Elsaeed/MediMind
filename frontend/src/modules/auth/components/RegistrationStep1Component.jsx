'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';

export default function RegistrationStep1Component() {
  const router = useRouter();
  const { setRegistrationData, registrationData } = useAuth();
  
  const [email, setEmail] = useState(registrationData?.email || '');
  const [password, setPassword] = useState(registrationData?.password || '');
  const [role, setRole] = useState(registrationData?.role || 'patient');
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = (e) => {
    e.preventDefault();
    setRegistrationData({ ...registrationData, email, password, role });
    
    if (role === 'patient') {
      router.push('/auth/register/patient');
    } else if (role === 'caregiver') {
      router.push('/auth/register/caregiver');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      <header className="w-full flex justify-center py-6 md:py-8 z-10 relative">
        <img 
          alt="MediMind Logo" 
          className="h-12 w-auto" 
          width={48}
          height={48}
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-OugZQPn5PYc6lK1g2NgI6-0NcCxKaNLvBpSeA0B0oc6uFyAmJJuQo6Bnzyu2nKJhAk0UWSeHYkE2bGlsnCt3Jx92b0fCfN_4wtCu3oGHGJ_g4bdZUjLsRMcyAxNDk7W2mdxKjW8STG_-SEwQ8vqVfg04cXdgJ-53v8rBxBrwi_I8x68F2qbWoMw_F5s2bFq0RZ1iYrIpHsH1erlyWqi83HcFY1ZYpkz09WGIX-1jFrTz4wfNpO3fgQ" 
        />
      </header>

      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full relative z-10">
        <div className="w-full max-w-[480px] bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl p-6 md:p-10 backdrop-blur-md relative overflow-hidden">
          
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="mb-8 text-center">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Step 1 of 2</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Account Setup</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-primary rounded-full"></div>
              </div>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-fixed-dim tracking-tight mb-2">Create Account</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Join MediMind to manage care with precision.</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleContinue}>
            {/* Account Details Section */}
            <div className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="email">Email Address</label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">mail</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" 
                    id="email" 
                    required 
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="password">Password</label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px]">lock</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-10 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" 
                    id="password" 
                    required 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-opacity-70 text-[20px] hover:text-on-surface transition-colors">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Role Selection Section */}
            <div className="pt-2">
              <h2 className="font-label-md text-label-md text-on-surface mb-3 flex items-center gap-2">
                I am registering as a:
                <span className="material-symbols-outlined text-primary text-[16px] cursor-help" title="Select your primary role to customize your experience">info</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Patient Role Card */}
                <label className="relative cursor-pointer">
                  <input 
                    className="peer sr-only" 
                    name="role" 
                    type="radio" 
                    value="patient"
                    checked={role === 'patient'}
                    onChange={() => setRole('patient')}
                  />
                  <div className={`h-full border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-surface hover:bg-surface-variant/50 transition-all ${role === 'patient' ? 'border-[#95ccff] bg-[#5c9bd1]/10' : 'border-outline-variant/40'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'patient' ? 'bg-primary/20' : 'bg-surface-container-high'}`}>
                      <span className={`material-symbols-outlined text-[28px] transition-colors ${role === 'patient' ? 'text-[#95ccff]' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>personal_injury</span>
                    </div>
                    <span className="font-label-md text-label-md text-center text-on-surface">Patient</span>
                  </div>
                </label>
                
                {/* Caregiver Role Card */}
                <label className="relative cursor-pointer">
                  <input 
                    className="peer sr-only" 
                    name="role" 
                    type="radio" 
                    value="caregiver"
                    checked={role === 'caregiver'}
                    onChange={() => setRole('caregiver')}
                  />
                  <div className={`h-full border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-surface hover:bg-surface-variant/50 transition-all ${role === 'caregiver' ? 'border-[#95ccff] bg-[#5c9bd1]/10' : 'border-outline-variant/40'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === 'caregiver' ? 'bg-primary/20' : 'bg-surface-container-high'}`}>
                      <span className={`material-symbols-outlined text-[28px] transition-colors ${role === 'caregiver' ? 'text-[#95ccff]' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>supervisor_account</span>
                    </div>
                    <span className="font-label-md text-label-md text-center text-on-surface">Caregiver</span>
                  </div>
                </label>
                
              </div>
            </div>
            
            {/* Submit Action */}
            <div className="pt-4">
              <button className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all" type="submit">
                Continue
                <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
              </button>
              <p className="mt-4 text-center font-body-md text-label-sm text-on-surface-variant">
                Already have an account? 
                <Link className="font-label-md text-primary hover:text-primary-fixed transition-colors ml-1" href="/auth/login">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
      
      {/* Optional: Subtle ambient background element */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] transform translate-x-[-20%] translate-y-[20%]"></div>
      </div>
    </div>
  );
}
