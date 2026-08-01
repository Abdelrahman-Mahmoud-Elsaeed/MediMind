"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTranslation } from "@/shared/lib/i18nContext";
import { usePatientProfile } from "../hooks/usePatientProfile";
import { usePatientConditionsQuery } from "../hooks/usePatientQueries";
import { Card, Badge, Button } from "@/shared/components/ui";
import {
  Share2,
  Download,
  Camera,
  FileText,
  Activity,
  Plus,
  Phone,
  MessageSquare,
  ChevronRight,
  User,
  MapPin,
  X,
  QrCode,
  Sparkles,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Loader2
} from "lucide-react";

export default function PatientProfileComponent() {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const fileInputRef = useRef(null);

  const { data: conditions = [] } = usePatientConditionsQuery();

  const {
    profile,
    loading,
    error,
    isEditing,
    setIsEditing,
    saving,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    dob,
    setDob,
    bloodType,
    setBloodType,
    height,
    setHeight,
    weight,
    setWeight,
    allergiesText,
    setAllergiesText,
    emergencyContacts,
    setEmergencyContacts,
    addresses,
    setAddresses,
    updateProfile
  } = usePatientProfile();

  // Modals & Image Upload state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // New Contact Form state
  const [newContactName, setNewContactName] = useState("");
  const [newContactRel, setNewContactRel] = useState("Family");
  const [newContactPhone, setNewContactPhone] = useState("");

  // New Address Form state
  const [newAddrStreet, setNewAddrStreet] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("San Francisco");
  const [newAddrState, setNewAddrState] = useState("CA");
  const [newAddrZip, setNewAddrZip] = useState("94121");

  // Notifications & Data Sharing state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataSharingOptIn, setDataSharingOptIn] = useState(true);
  const [researchOptIn, setResearchOptIn] = useState(true);

  // Display Name & Email
  const displayName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : user?.name || "Sarah Jenkins";
  const displayEmail = user?.email || "sarah.jenkins@medimind.io";
  const displayPhone = phone || "+1 (555) 012-3456";

  // Handle Profile Picture File Change with Canvas Compression
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(isAr ? "يرجى اختيار ملف صورة صالح (PNG, JPEG, WebP)" : "Please select a valid image file (PNG, JPEG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(isAr ? "يجب أن يكون حجم الصورة أقل من ١٠ ميجابايت" : "Image file size must be less than 10MB");
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        try {
          await updateProfile({ profilePictureUrl: compressedBase64 });
          alert(isAr ? "تم تحديث الصورة الشخصية بنجاح!" : "Profile picture updated successfully!");
        } catch (err) {
          console.error("Failed to upload profile image:", err);
          alert(isAr ? "تعذر تحديث الصورة الشخصية" : "Failed to update profile picture");
        } finally {
          setIsUploadingImage(false);
        }
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  // Calculate age
  const calculateAge = (dobString) => {
    if (!dobString) return 32;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 32;
  };

  // Calculate BMI
  const computedBmi = React.useMemo(() => {
    if (height && weight && height > 0) {
      const hMeters = height / 100;
      return (weight / (hMeters * hMeters)).toFixed(1);
    }
    return "22.1";
  }, [height, weight]);

  // Download Medical Records JSON file
  const handleDownloadRecords = () => {
    const recordData = {
      patientName: displayName,
      email: displayEmail,
      phone: displayPhone,
      dateOfBirth: dob || "1992-08-24",
      bloodType: bloodType || "O+",
      vitals: {
        heightCm: height || 168,
        weightKg: weight || 62.5,
        bmi: computedBmi,
      },
      allergies: allergiesText ? allergiesText.split(",").map((s) => s.trim()) : ["PENICILLIN"],
      emergencyContacts,
      addresses,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MediMind_Medical_Records_${displayName.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Add Contact Handler
  const handleAddContactSubmit = (e) => {
    e.preventDefault();
    if (!newContactName) return;
    const newEntry = {
      id: `ec-${Date.now()}`,
      name: newContactName,
      relationship: newContactRel,
      phone: newContactPhone || "+1 (555) 000-0000",
      isPrimary: emergencyContacts.length === 0,
    };
    setEmergencyContacts((prev) => [...prev, newEntry]);
    setNewContactName("");
    setNewContactPhone("");
    setIsAddContactOpen(false);
  };

  // Add Address Handler
  const handleAddAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddrStreet) return;
    const newEntry = {
      id: `addr-${Date.now()}`,
      type: addresses.length === 0 ? "Home Address" : "Office / Shipping",
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      postalCode: newAddrZip,
      isPrimary: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, newEntry]);
    setNewAddrStreet("");
    setIsAddAddressOpen(false);
  };

  return (
    <MainLayout activePath="/profile">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageFileChange}
        />

        {/* HERO CARD: User Profile Header matching Reference UI */}
        <Card className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
            {/* Avatar & User Details Left */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Profile Avatar with Camera Icon Overlay */}
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-teal-500/20 p-1 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-teal-600 dark:text-teal-400 font-extrabold text-4xl">
                  {isUploadingImage ? (
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                  ) : profile?.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    displayName.charAt(0)
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 cursor-pointer transition-transform hover:scale-110"
                  title={isAr ? "رفع صورة جديدة" : "Upload Profile Picture"}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* User Identity Meta Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-3xl font-extrabold text-[#0b1c30] dark:text-slate-100 tracking-tight">
                    {displayName}
                  </h1>
                  <Badge variant="success" className="bg-teal-600 text-white px-3 py-1 font-bold text-xs rounded-full">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {isAr ? "عضو متميز" : "Premium Member"}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    {calculateAge(dob)} {isAr ? "عاماً" : "Years Old"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-teal-600 font-bold">
                    <Activity className="w-3.5 h-3.5" />
                    {isAr ? `فصيلة الدم ${bloodType}` : `Type ${bloodType}`}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {addresses[0] ? `${addresses[0].city}, ${addresses[0].state}` : "San Francisco, CA"}
                  </span>
                </div>

                {/* Share Medical ID & Download Records Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-3">
                  <Button
                    onClick={() => setIsShareModalOpen(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md h-auto text-xs"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {isAr ? "مشاركة الهوية الطبية" : "Share Medical ID"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadRecords}
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold px-5 py-2.5 rounded-xl h-auto text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isAr ? "تحميل السجل الطبي" : "Download Records"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Decorative Subtle Medical Graphic Pattern Right */}
            <div className="hidden lg:block w-64 h-32 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 p-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-teal-500/20">
                <Activity className="w-24 h-24" />
              </div>
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-teal-600 tracking-wider">MediMind Verified</span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Continuous Health Protection & Encrypted Vault</p>
              </div>
            </div>
          </div>
        </Card>

        {/* MEDICAL SUMMARY BAR CARDS (4 Stats Grid) matching Reference UI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Height */}
          <Card className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              {isAr ? "الطول" : "HEIGHT"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{height}</span>
              <span className="text-xs font-bold text-slate-400">cm</span>
            </div>
          </Card>

          {/* Weight */}
          <Card className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              {isAr ? "الوزن" : "WEIGHT"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{weight}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
          </Card>

          {/* BMI */}
          <Card className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                {isAr ? "مؤشر كتلة الجسم" : "BMI"}
              </span>
              <Badge variant="success" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5">
                {isAr ? "طبيعي" : "NORMAL"}
              </Badge>
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{computedBmi}</span>
          </Card>

          {/* Allergies */}
          <Card className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              {isAr ? "الحساسية" : "ALLERGIES"}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="destructive" className="bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase px-2 py-0.5 border border-rose-200 dark:border-rose-900">
                {allergiesText || "PENICILLIN"}
              </Badge>
            </div>
          </Card>
        </div>

        {/* HEALTH RECORDS SECTION matching Reference UI */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-xl font-extrabold tracking-tight">{isAr ? "السجلات الصحية" : "Health Records"}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/medical-records/conditions">
              <Card className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-teal-500/50 transition-all cursor-pointer flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                      {isAr ? "الوثائق السريرية والحالات" : "Clinical Documents & Conditions"}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {isAr ? `${conditions.length} حالات مسجلة في ملفك` : `${conditions.length} conditions logged in profile`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Card>
            </Link>

            <Link href="/medical-records/conditions">
              <Card className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-teal-500/50 transition-all cursor-pointer flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                      {isAr ? "السجلات والتحاليل الطبية" : "Medical Records & Lab History"}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {isAr ? "خزينة السجلات الطبية المشفرة" : "Encrypted medical profile vault"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Card>
            </Link>
          </div>
        </div>

        {/* EMERGENCY CONTACTS SECTION matching Reference UI */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <ShieldAlert className="w-5 h-5 text-teal-600" />
              <h3 className="text-xl font-extrabold tracking-tight">{isAr ? "جهات اتصال الطوارئ" : "Emergency Contacts"}</h3>
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsAddContactOpen(true)}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {isAr ? "إضافة جهة جديدة" : "+ Add New"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <Card key={contact.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-lg">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{contact.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {contact.isPrimary ? (isAr ? "رئيسي • الأم" : "Primary • Mother") : (isAr ? "جهات الطوارئ" : "Backup Contact")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a href={`tel:${contact.phone}`}>
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl h-auto">
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      {isAr ? "اتصال" : "Call"}
                    </Button>
                  </a>
                  <a href={`sms:${contact.phone}`}>
                    <Button variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl h-auto">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      {isAr ? "رسالة" : "Text"}
                    </Button>
                  </a>
                </div>
              </Card>
            ))}

            {/* Dashed Add Backup Contact Card */}
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-teal-500/50 p-6 rounded-2xl text-center flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-slate-400 group-hover:text-teal-600 uppercase tracking-wider">
                {isAr ? "إضافة جهة اتصال احتياطية" : "ADD BACKUP CONTACT"}
              </span>
            </button>
          </div>
        </div>

        {/* PERSONAL INFORMATION & MANAGE ADDRESSES (2 Columns Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100">{isAr ? "المعلومات الشخصية" : "Personal Information"}</h3>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                {isAr ? "تعديل الكل" : "Edit All"}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  {isAr ? "الاسم الكامل" : "Full Name"}
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {displayName}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  {isAr ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {displayEmail}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  {isAr ? "رقم الهاتف" : "Phone Number"}
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {displayPhone}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  {isAr ? "تاريخ الميلاد" : "Date of Birth"}
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {dob ? new Date(dob).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "August 24, 1992"}
                </div>
              </div>
            </div>
          </Card>

          {/* Manage Addresses */}
          <Card className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100">{isAr ? "إدارة العناوين" : "Manage Addresses"}</h3>
              <Button
                variant="ghost"
                onClick={() => setIsAddAddressOpen(true)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {isAr ? "إضافة عنوان جديد" : "+ Add New"}
              </Button>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    addr.isPrimary
                      ? "bg-teal-500/5 border-teal-500/40"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{addr.type}</h4>
                    {addr.isPrimary && (
                      <Badge variant="success" className="bg-teal-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5">
                        {isAr ? "الرئيسي" : "PRIMARY"}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
                    {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    {!addr.isPrimary && (
                      <button
                        onClick={() => {
                          setAddresses((prev) => prev.map((a) => ({ ...a, isPrimary: a.id === addr.id })));
                        }}
                        className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        {isAr ? "تعيين كرئيسي" : "Set as Primary"}
                      </button>
                    )}
                    <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
                      {isAr ? "تعديل" : "Edit"}
                    </button>
                    {!addr.isPrimary && (
                      <button
                        onClick={() => setAddresses((prev) => prev.filter((a) => a.id !== addr.id))}
                        className="text-rose-500 hover:underline cursor-pointer"
                      >
                        {isAr ? "حذف" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ACCOUNT & SETTINGS & PRIVACY (2 Columns Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account & Settings */}
          <Card className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <h3 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100">{isAr ? "الحساب والإعدادات" : "Account & Settings"}</h3>

            {/* Security Box */}
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">{isAr ? "الأمان" : "SECURITY"}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{isAr ? "كلمة المرور" : "Password"}</div>
                      <div className="text-[10px] text-slate-400">Updated 2mo ago</div>
                    </div>
                  </div>
                  <Button variant="link" onClick={() => alert("Password update dialog opened")} className="text-xs font-bold text-teal-600 p-0 h-auto">
                    {isAr ? "تحديث" : "Update"}
                  </Button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{isAr ? "التحقق بخطوتين 2FA" : "2FA"}</div>
                      <div className="text-[10px] text-teal-600 font-bold">✓ Active</div>
                    </div>
                  </div>
                  <Button variant="link" onClick={() => alert("2FA management dialog opened")} className="text-xs font-bold text-teal-600 p-0 h-auto">
                    {isAr ? "إدارة" : "Manage"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Language & Notifications Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">{isAr ? "اللغة" : "LANGUAGE"}</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none">
                  <option value="en">English (US)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">{isAr ? "التنبيهات" : "NOTIFICATIONS"}</label>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{isAr ? "تنبيهات البريد" : "Email Alerts"}</span>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy */}
          <Card className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100">{isAr ? "الخصوصية" : "Privacy"}</h3>

              <div className="space-y-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dataSharingOptIn}
                    onChange={(e) => setDataSharingOptIn(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{isAr ? "مشاركة البيانات" : "Data Sharing"}</div>
                    <div className="text-[11px] text-slate-400">Allow verified clinicians view specs and medication logs</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={researchOptIn}
                    onChange={(e) => setResearchOptIn(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-teal-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{isAr ? "البحوث والمساهمة" : "Research"}</div>
                    <div className="text-[11px] text-slate-400">Opt-in for anonymous contribution to adherence medical research</div>
                  </div>
                </label>
              </div>
            </div>

            {/* HIPAA Compliance Badge Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>HIPAA COMPLIANT</span>
              <span className="flex items-center gap-1 text-teal-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                ENCRYPTED & SECURE CLOUD
              </span>
            </div>
          </Card>
        </div>

        {/* PAGE FOOTER matching Reference UI */}
        <footer className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
          <div>
            <span className="font-extrabold text-teal-600">MediMind Health</span> © 2026 MediMind Health. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#" className="hover:text-slate-600">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</Link>
            <Link href="#" className="hover:text-slate-600">{isAr ? "شروط الخدمة" : "Terms of Service"}</Link>
            <Link href="#" className="hover:text-slate-600">{isAr ? "مركز المساعدة" : "Help Center"}</Link>
            <Link href="#" className="hover:text-slate-600">{isAr ? "سهولة الوصول" : "Accessibility"}</Link>
          </div>
        </footer>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{isAr ? "تعديل البيانات الشخصية" : "Edit Personal Details"}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateProfile();
                  setIsEditing(false);
                }}
                className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Blood Type</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                    {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ التغييرات" : "Save Changes")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARE MEDICAL ID MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{isAr ? "بطاقة الهوية الطبية" : "Medical ID Card"}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsShareModalOpen(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-6 rounded-2xl space-y-3">
                <QrCode className="w-24 h-24 text-teal-600 mx-auto" />
                <h4 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{displayName}</h4>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  Type {bloodType} • Age {calculateAge(dob)} • Emergency: {emergencyContacts[0]?.phone || displayPhone}
                </p>
              </div>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`MediMind Medical ID: ${displayName}, Blood Type: ${bloodType}, Emergency: ${emergencyContacts[0]?.phone || displayPhone}`);
                  alert(isAr ? "تم نسخ رابط الهوية الطبية!" : "Medical ID details copied to clipboard!");
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5"
              >
                {isAr ? "نسخ الرابط الطبي" : "Copy Medical ID Link"}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD EMERGENCY CONTACT MODAL */}
      <AnimatePresence>
        {isAddContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{isAr ? "إضافة جهة طوارئ" : "Add Emergency Contact"}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAddContactOpen(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block mb-1 text-slate-500">Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Jenkins"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Brother / Spouse"
                    value={newContactRel}
                    onChange={(e) => setNewContactRel(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-500">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddContactOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                    Add Contact
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD ADDRESS MODAL */}
      <AnimatePresence>
        {isAddAddressOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{isAr ? "إضافة عنوان جديد" : "Add New Address"}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAddAddressOpen(false)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleAddAddressSubmit} className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block mb-1 text-slate-500">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 789 Market Street"
                    value={newAddrStreet}
                    onChange={(e) => setNewAddrStreet(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 text-slate-500">City</label>
                    <input
                      type="text"
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-500">State / Zip</label>
                    <input
                      type="text"
                      value={newAddrZip}
                      onChange={(e) => setNewAddrZip(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddAddressOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                    Save Address
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
