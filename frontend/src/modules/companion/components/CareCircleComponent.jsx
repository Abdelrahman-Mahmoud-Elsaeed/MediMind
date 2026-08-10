"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useTranslation } from "@/shared/lib/i18nContext";
import { useCareCircle } from "../hooks/useCareCircle";
import { Card, Badge, Button } from "@/shared/components/ui";
import {
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  Video,
  Plus,
  History,
  CheckCircle2,
  Clock,
  Activity,
  X,
  ChevronRight,
  ShieldCheck,
  Send,
  FileText,
  AlertCircle
} from "lucide-react";

export default function CareCircleComponent() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";

  const {
    loading,
    error,
    submitting,
    emailInput,
    setEmailInput,
    canManageMeds,
    setCanManageMeds,
    canViewRecords,
    setCanViewRecords,
    activeCaregivers,
    pendingInvitations,
    sendInvitation,
    revokeRelationship,
    validationError
  } = useCareCircle();

  // Interactive Modals State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState(null);

  // Shared Care Notes State
  const [careNotes, setCareNotes] = useState([]);

  // New Note Form State
  const [newNoteAuthor, setNewNoteAuthor] = useState("");
  const [newNoteText, setNewNoteText] = useState("");

  // Dynamic Care Team Members derived strictly from API
  const careTeamMembers = useMemo(() => {
    if (!activeCaregivers || activeCaregivers.length === 0) return [];
    return activeCaregivers.map((r, idx) => {
      const cg = r.caregiverId || {};
      const name = cg.firstName && cg.lastName ? `${cg.firstName} ${cg.lastName}` : (r.relation || "Caregiver");
      const roles = ["Primary Physician", "Family Member", "Care Coordinator"];

      return {
        id: r.relationshipId || r._id || r.id || String(idx),
        name,
        role: r.relation || roles[idx % roles.length],
        status: r.status === "ACCEPTED" ? "AVAILABLE" : "PENDING",
        statusType: r.status === "ACCEPTED" ? "available" : "busy",
        actions: ["Call", "Email"],
        email: cg.email || "caregiver@medimind.io",
        phone: cg.phone || "+1 (555) 019-2831",
        raw: r,
      };
    });
  }, [activeCaregivers]);

  // Activity Feed derived dynamically from active caregivers & invites
  const activityFeed = useMemo(() => {
    const list = [];
    if (activeCaregivers && activeCaregivers.length > 0) {
      activeCaregivers.forEach((r) => {
        const cg = r.caregiverId || {};
        const name = cg.firstName && cg.lastName ? `${cg.firstName} ${cg.lastName}` : (r.relation || "Caregiver");
        list.push({
          id: `act-${r._id || r.id}`,
          actor: name,
          action: isAr ? "انضم إلى" : "joined the",
          target: isAr ? "دائرة الرعاية الصحية" : "Care Circle",
          time: isAr ? "نشط الآن" : "Active Now",
        });
      });
    }
    if (pendingInvitations && pendingInvitations.length > 0) {
      pendingInvitations.forEach((r) => {
        const name = r.caregiverEmail || "Caregiver";
        list.push({
          id: `act-p-${r._id || r.id}`,
          actor: name,
          action: isAr ? "تم إرسال دعوة معلقة إلى" : "Invitation pending for",
          target: isAr ? "دائرة الرعاية" : "Care Circle",
          time: isAr ? "مؤخراً" : "Recently",
        });
      });
    }
    return list;
  }, [activeCaregivers, pendingInvitations, isAr]);

  // Add Care Note Submit Handler
  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const initials = newNoteAuthor
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newNote = {
      id: `n-${Date.now()}`,
      initials: initials || "JW",
      author: newNoteAuthor,
      timeAgo: "Just now",
      text: newNoteText,
    };

    setCareNotes((prev) => [newNote, ...prev]);
    setNewNoteText("");
    setIsAddNoteModalOpen(false);
  };

  return (
    <MainLayout activePath="/caregivers">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] dark:text-slate-100 tracking-tight">
              {isAr ? "دائرة الرعاية الصحية" : "Caregivers Circle"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {isAr
                ? "تنسيق وتواصل دائم مع شبكة الدعم والرعاية الخاصة بك."
                : "Coordinate and connect with your dedicated support network."}
            </p>
          </div>

          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md h-auto text-xs flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isAr ? "دعوة مقدم رعاية جديد" : "Invite New Caregiver"}
          </Button>
        </div>

        {/* PENDING CONNECTION REQUESTS SECTION */}
        {(pendingIncoming?.length > 0 || pendingOutgoing?.length > 0) && (
          <div className="space-y-4 bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/30 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isAr ? "طلبات الربط المعلقة" : "Pending Connection Requests"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Incoming Requests */}
              {pendingIncoming?.map((req) => {
                const cgName = req.caregiverId
                  ? `${req.caregiverId.firstName || ""} ${req.caregiverId.lastName || ""}`.trim() || req.caregiverId.email
                  : (isAr ? "مقدم رعاية جديد" : "New Caregiver");

                return (
                  <div
                    key={req.relationshipId || req.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{cgName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr ? "طلب ربط من مقدم رعاية" : "Incoming Caregiver Request"} • {req.relation || "Caregiver"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => respondToRequest(req.relationshipId || req.id, "ACCEPTED")}
                        disabled={updatingStatus}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {isAr ? "قبول" : "Accept"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondToRequest(req.relationshipId || req.id, "REJECTED")}
                        disabled={updatingStatus}
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl"
                      >
                        {isAr ? "رفض" : "Reject"}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Outgoing Requests */}
              {pendingOutgoing?.map((req) => {
                const cgName = req.caregiverId
                  ? `${req.caregiverId.firstName || ""} ${req.caregiverId.lastName || ""}`.trim() || req.caregiverId.email
                  : (isAr ? "مقدم رعاية" : "Caregiver");

                return (
                  <div
                    key={req.relationshipId || req.id}
                    className="bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{cgName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr ? "دعوة كـ " : "Invited as "} {req.relation || "Caregiver"}
                      </p>
                    </div>

                    <Badge variant="warning" className="text-[10px]">
                      {isAr ? "بانتظار قبول مقدم الرعاية" : "Pending Caregiver Acceptance"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CARE TEAM SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#0b1c30] dark:text-slate-100 tracking-tight">
              {isAr ? "فريق الرعاية" : "Care Team"}
            </h2>
            <span className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              {careTeamMembers.length} {isAr ? "أعضاء نشطون" : "MEMBERS ACTIVE"}
            </span>
          </div>

          {/* Caregiver Cards Grid */}
          {careTeamMembers.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <p className="text-sm font-bold text-slate-500">
                {isAr ? "لا يوجد أعضاء نشطون في دائرة الرعاية حالياً." : "No active members in your care circle yet."}
              </p>
              <Button onClick={() => setIsInviteModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs">
                <UserPlus className="w-4 h-4 mr-2" />
                {isAr ? "دعوة مقدم رعاية جديد" : "Invite New Caregiver"}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {careTeamMembers.map((member) => {
                let statusBadgeBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                let dotColor = "bg-emerald-500";
                if (member.statusType === "online") {
                  statusBadgeBg = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
                  dotColor = "bg-sky-500";
                } else if (member.statusType === "busy") {
                  statusBadgeBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                  dotColor = "bg-rose-500";
                }

                return (
                  <Card
                    key={member.id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-lg shadow-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{member.name}</h3>
                          <p className="text-xs text-slate-400 font-semibold">{member.role}</p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${statusBadgeBg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {member.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {member.actions.map((act) => {
                        let icon = <Phone className="w-3.5 h-3.5 mr-1" />;
                        if (act === "Email") icon = <Mail className="w-3.5 h-3.5 mr-1" />;
                        else if (act === "Message") icon = <MessageSquare className="w-3.5 h-3.5 mr-1" />;
                        else if (act === "Video") icon = <Video className="w-3.5 h-3.5 mr-1" />;

                        return (
                          <Button
                            key={act}
                            variant="outline"
                            onClick={() => setActiveActionModal({ type: act, name: member.name, email: member.email, phone: member.phone })}
                            className="flex-1 border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-400 font-bold text-xs py-2 rounded-xl h-auto hover:bg-teal-50 dark:hover:bg-teal-950/40"
                          >
                            {icon}
                            {act}
                          </Button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM TWO COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Shared Care Notes */}
          <Card className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-center pb-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-xl font-extrabold tracking-tight">{isAr ? "ملاحظات الرعاية المشتركة" : "Shared Care Notes"}</h3>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddNoteModalOpen(true)}
                className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 hover:bg-teal-100"
                title={isAr ? "إضافة ملاحظة جديدة" : "Add Care Note"}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            {/* Notes List */}
            {careNotes.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                {isAr ? "لا توجد ملاحظات رعاية مشتركة بعد. انقر فوق + لإضافة ملاحظة." : "No shared care notes yet. Click + above to post a note."}
              </div>
            ) : (
              <div className="space-y-4">
                {careNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-slate-50/80 dark:bg-slate-800/60 p-4.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-4 shadow-2xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                      {note.initials}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{note.author}</h4>
                        <span className="text-[10px] font-semibold text-slate-400">{note.timeAgo}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{note.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Right Column: Circle Activity Feed */}
          <Card className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 pb-2">
              <History className="w-5 h-5 text-teal-600" />
              <h3 className="text-xl font-extrabold tracking-tight">{isAr ? "سجل نشاط الدائرة" : "Circle Activity Feed"}</h3>
            </div>

            {/* Feed Timeline */}
            {activityFeed.length === 0 ? (
              <div className="p-6 text-center text-xs font-bold text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                {isAr ? "لا يوجد نشاط مسجل في الدائرة مؤخراً." : "No activity logged in the circle recently."}
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {activityFeed.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white dark:ring-slate-900">
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </div>

                    <div className="space-y-0.5 pt-0.5">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-normal">
                        <strong className="text-slate-900 dark:text-slate-100 font-bold">{item.actor}</strong> {item.action}{" "}
                        <strong className="text-teal-700 dark:text-teal-400 font-bold">{item.target}</strong>
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold block">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* MODAL 1: Invite Caregiver Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-teal-600">
                  <UserPlus className="w-5 h-5" />
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{isAr ? "دعوة مقدم رعاية" : "Invite Caregiver"}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsInviteModalOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {validationError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 p-3 rounded-xl text-xs font-bold">
                  {validationError}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await sendInvitation(e);
                  setIsInviteModalOpen(false);
                }}
                className="space-y-4 text-xs font-bold"
              >
                <div>
                  <label className="block text-slate-500 uppercase tracking-wider mb-1">{isAr ? "البريد الإلكتروني لمقدم الرعاية" : "Caregiver Email Address"}</label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="caregiver@example.com"
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <span className="block text-slate-500 uppercase tracking-wider">{isAr ? "صلاحيات الوصول" : "Access Permissions"}</span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span>{isAr ? "إدارة الخطة العلاجية والأدوية" : "Manage Medications"}</span>
                    <input
                      type="checkbox"
                      checked={canManageMeds}
                      onChange={(e) => setCanManageMeds(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span>{isAr ? "عرض السجلات الطبية الكاملة" : "View Medical Records"}</span>
                    <input
                      type="checkbox"
                      checked={canViewRecords}
                      onChange={(e) => setCanViewRecords(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
                    <Send className="w-3.5 h-3.5 mr-1" />
                    {submitting ? (isAr ? "جاري الإرسال..." : "Sending...") : (isAr ? "إرسال الدعوة" : "Send Invitation")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Action Trigger Dialog */}
      <AnimatePresence>
        {activeActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {activeActionModal.type} {activeActionModal.name}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setActiveActionModal(null)} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-teal-50 dark:bg-teal-950/40 p-6 rounded-2xl space-y-2">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto text-xl font-bold">
                  {activeActionModal.name.charAt(0)}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{activeActionModal.name}</h4>
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                  {activeActionModal.type === "Call" || activeActionModal.type === "Video"
                    ? activeActionModal.phone
                    : activeActionModal.email}
                </p>
              </div>

              <Button
                onClick={() => {
                  alert(`Starting ${activeActionModal.type} session with ${activeActionModal.name}...`);
                  setActiveActionModal(null);
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5"
              >
                {isAr ? `بدء الـ ${activeActionModal.type} الآن` : `Start ${activeActionModal.type} Now`}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
