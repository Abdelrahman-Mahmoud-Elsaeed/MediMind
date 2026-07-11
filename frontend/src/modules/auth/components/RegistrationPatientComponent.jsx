import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { registerPatientSchema } from '../validation/authValidation';

export default function RegistrationPatientComponent() {
  const router = useRouter();
  const { registrationData, register, loading, error, clearRegistrationData } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    bloodType: '',
    emName: '',
    emPhone: ''
  });
  const [touched, setTouched] = useState({});

  // Derive errors and validity from current values
  const validationResult = registerPatientSchema.safeParse(formData);
  const errors = {};
  if (!validationResult.success) {
    validationResult.error.issues.forEach((issue) => {
      const path = issue.path[0];
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    });
  }
  const isValid = validationResult.success;

  useEffect(() => {
    // If no data from step 1, redirect back
    if (!registrationData || !registrationData.email) {
      router.push('/auth/register');
    }
  }, [registrationData, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    
    const completeData = {
      ...registrationData,
      ...formData,
      role: 'PATIENT' // Backend expects uppercase enum usually, or match whatever it requires
    };

    try {
      const resultAction = await register(completeData);
      if (resultAction.type === 'auth/register/fulfilled') {
        clearRegistrationData();
        router.push('/dashboard');
      }
    } catch (err) {
      // Handled by redux
    }
  };

  if (!registrationData) return null;

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
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Step 2 of 2</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Profile Details</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full w-full bg-primary rounded-full"></div>
              </div>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-fixed-dim tracking-tight mb-2">Complete Your Profile</h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 bg-surface-variant border border-outline-variant/50 text-on-surface-variant font-label-sm text-label-sm rounded-full shadow-inner">
              <span className="material-symbols-outlined text-[16px]">person</span>
              Registering as Patient
            </div>
          </div>
          
          {error && (
            <div className="w-full bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-center font-body-md">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <fieldset className="flex flex-col gap-5">
              <legend className="font-body-lg text-body-lg text-primary-fixed-dim border-b border-outline-variant/30 pb-2 w-full mb-2">Personal Information</legend>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="firstName">First Name <span className="text-error">*</span></label>
                  <div className={`relative rounded-lg bg-surface border transition-all ${
                    touched.firstName && errors.firstName 
                      ? 'border-error focus-within:shadow-[0_0_0_2px_rgba(255,180,171,0.3)]' 
                      : 'border-outline-variant/50 focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]'
                  }`}>
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="firstName" placeholder="Enter first name" type="text" value={formData.firstName} onChange={handleChange} onBlur={() => handleBlur('firstName')} />
                  </div>
                  {touched.firstName && errors.firstName && (
                    <p className="text-error font-body-sm text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="lastName">Last Name <span className="text-error">*</span></label>
                  <div className={`relative rounded-lg bg-surface border transition-all ${
                    touched.lastName && errors.lastName 
                      ? 'border-error focus-within:shadow-[0_0_0_2px_rgba(255,180,171,0.3)]' 
                      : 'border-outline-variant/50 focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]'
                  }`}>
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="lastName" placeholder="Enter last name" type="text" value={formData.lastName} onChange={handleChange} onBlur={() => handleBlur('lastName')} />
                  </div>
                  {touched.lastName && errors.lastName && (
                    <p className="text-error font-body-sm text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="phone">Phone Number <span className="text-error">*</span></label>
                  <div className={`relative rounded-lg bg-surface border transition-all ${
                    touched.phone && errors.phone 
                      ? 'border-error focus-within:shadow-[0_0_0_2px_rgba(255,180,171,0.3)]' 
                      : 'border-outline-variant/50 focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]'
                  }`}>
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="phone" placeholder="(555) 000-0000" type="tel" value={formData.phone} onChange={handleChange} onBlur={() => handleBlur('phone')} />
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="text-error font-body-sm text-xs mt-1">{errors.phone}</p>
                  )}
                  <p className="font-label-sm text-label-sm text-outline flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-[14px]">notifications_active</span> Used for secure SMS alerts</p>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="dob">Date of Birth</label>
                  <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none shadow-inner appearance-none relative z-10 rounded-lg" id="dob" type="date" value={formData.dob} onChange={handleChange} />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 md:w-[calc(50%-10px)]">
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="bloodType">Blood Type</label>
                <div className="relative rounded-lg bg-surface border border-outline-variant/50 transition-all focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]">
                  <select className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none shadow-inner appearance-none cursor-pointer rounded-lg" id="bloodType" value={formData.bloodType} onChange={handleChange}>
                    <option className="text-outline" disabled value="">Select Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-opacity-70 pointer-events-none">expand_more</span>
                </div>
              </div>
            </fieldset>
            
            <fieldset className="flex flex-col gap-4 bg-surface/50 p-5 rounded-xl border border-surface-bright shadow-inner">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-error-container/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-error">emergency</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-sm text-label-sm text-on-surface mb-1.5" htmlFor="emName">Contact Name</label>
                  <div className={`relative rounded-lg bg-surface border transition-all ${
                    touched.emName && errors.emName 
                      ? 'border-error focus-within:shadow-[0_0_0_2px_rgba(255,180,171,0.3)]' 
                      : 'border-outline-variant/50 focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]'
                  }`}>
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="emName" placeholder="Full name" type="text" value={formData.emName} onChange={handleChange} onBlur={() => handleBlur('emName')} />
                  </div>
                  {touched.emName && errors.emName && (
                    <p className="text-error font-body-sm text-xs mt-1">{errors.emName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block font-label-sm text-label-sm text-on-surface mb-1.5" htmlFor="emPhone">Contact Phone</label>
                  <div className={`relative rounded-lg bg-surface border transition-all ${
                    touched.emPhone && errors.emPhone 
                      ? 'border-error focus-within:shadow-[0_0_0_2px_rgba(255,180,171,0.3)]' 
                      : 'border-outline-variant/50 focus-within:shadow-[0_0_0_2px_rgba(149,204,255,0.3)] focus-within:border-[#95ccff]'
                  }`}>
                    <input className="block w-full px-3 py-2.5 bg-transparent border-none text-on-surface font-body-md text-body-md focus:ring-0 focus:outline-none placeholder-on-surface-variant/50 rounded-lg" id="emPhone" placeholder="(555) 000-0000" type="tel" value={formData.emPhone} onChange={handleChange} onBlur={() => handleBlur('emPhone')} />
                  </div>
                  {touched.emPhone && errors.emPhone && (
                    <p className="text-error font-body-sm text-xs mt-1">{errors.emPhone}</p>
                  )}
                </div>
              </div>
            </fieldset>
            
            <div className="pt-2 flex flex-col gap-4">
              <button disabled={!isValid || loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md bg-primary text-on-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-all group disabled:opacity-50 disabled:cursor-not-allowed" type="submit">

                {loading ? 'Registering...' : 'Complete Registration'}
                {!loading && <span className="material-symbols-outlined text-[20px] ml-2 group-hover:translate-x-1 transition-transform">check_circle</span>}
              </button>
              <div className="flex items-center justify-center gap-1 font-label-sm text-label-sm text-outline">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <p>Your data is securely encrypted.</p>
              </div>
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
