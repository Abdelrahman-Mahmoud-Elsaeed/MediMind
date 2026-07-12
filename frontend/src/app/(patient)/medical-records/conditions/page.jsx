"use client";

import Link from "next/link";

export default function PatientConditionsPage() {
  const records = [
    {
      id: 1,
      title: "CBC Blood Test Report",
      category: "Lab Result",
      date: "Oct 12, 2024",
      filename: "cbc_blood_test.pdf",
      size: "1.2 MB",
      icon: "description",
      iconColor: "text-primary",
    },
    {
      id: 2,
      title: "Diabetes Prescription",
      category: "Prescription",
      date: "Sep 10, 2024",
      filename: "rx_metformin.jpg",
      size: "800 KB",
      icon: "prescriptions",
      iconColor: "text-secondary",
    },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex items-center justify-between px-margin-mobile h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/20 transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Medical Records</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 px-margin-mobile max-w-container-max mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Upload & Add Form */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Upload Zone */}
            <section className="bg-surface-container border border-dashed border-outline-variant/50 hover:bg-surface-container-high transition-colors rounded-2xl p-6 text-center cursor-pointer group">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform mb-1">
                  <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                </div>
                <h3 className="font-headline-md text-body-lg font-bold text-on-surface">Upload Documents</h3>
                <p className="text-on-surface-variant text-xs">PDF, PNG, or JPG (Max 5MB)</p>
              </div>
            </section>

            {/* Add Record Form */}
            <section className="bg-surface-container border border-outline-variant/10 rounded-2xl p-6">
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-xl">add_box</span>
                Add New Record
              </h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Record Title</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="e.g. Cholesterol Panel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Select Category</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface">
                    <option>Lab Result</option>
                    <option>Prescription</option>
                    <option>Imaging</option>
                    <option>Clinical Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Doctor Remarks</label>
                  <textarea
                    rows="3"
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-on-surface placeholder:text-on-surface-variant/40 resize-none"
                    placeholder="Observations..."
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-primary-container text-on-primary-container font-bold rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition-all">
                  Add Record to Vault
                </button>
              </form>
            </section>
          </div>

          {/* Right Column: Recent Records & Stats */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-body-lg font-bold text-on-surface">Recent Records</h2>
              <button className="text-primary text-xs font-bold hover:underline flex items-center gap-0.5">
                View All <span className="material-symbols-outlined text-xs">open_in_new</span>
              </button>
            </div>

            {/* Records List */}
            <div className="flex flex-col gap-4">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-surface-container border border-outline-variant/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/20 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                    <span className={`material-symbols-outlined text-2xl ${rec.iconColor}`}>{rec.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline-md text-base font-bold text-on-surface truncate">{rec.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                      <span className="bg-secondary-container/20 text-secondary px-2.5 py-0.5 rounded-full font-bold">
                        {rec.category}
                      </span>
                      <span>•</span>
                      <span>{rec.date}</span>
                    </div>
                    <div className="mt-2.5 bg-background border border-outline-variant/10 rounded-lg px-3 py-1.5 w-fit flex items-center gap-1.5 text-xs text-on-surface-variant/80">
                      <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
                      <span className="truncate">{rec.filename} ({rec.size})</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0">
                    <button className="flex-1 sm:flex-none border border-outline-variant hover:bg-surface-variant/10 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all">
                      View
                    </button>
                    <button className="flex-1 sm:flex-none text-error hover:bg-error-container/10 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Storage Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container border border-outline-variant/10 border-l-4 border-l-primary p-5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Vault Encryption</span>
                <h4 className="font-headline-md text-base font-bold text-on-surface mt-1">100% Encrypted</h4>
                <p className="text-[10px] text-primary mt-1 font-bold">Biometric locking active</p>
              </div>
              <div className="bg-surface-container border border-outline-variant/10 border-l-4 border-l-secondary p-5 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Total Storage</span>
                <h4 className="font-headline-md text-base font-bold text-on-surface mt-1">2.4 / 50 MB</h4>
                <div className="w-full bg-background h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="h-full bg-secondary w-[5%] rounded-full shadow-[0_0_8px_rgba(159,213,136,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-lg">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/home">
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm">Home</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/medications">
          <span className="material-symbols-outlined">medication</span>
          <span className="font-label-sm text-label-sm">Meds</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/adherence">
          <span className="material-symbols-outlined">query_stats</span>
          <span className="font-label-sm text-label-sm">Adherence</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary transition-transform duration-300" href="/caregivers">
          <span className="material-symbols-outlined">groups</span>
          <span className="font-label-sm text-label-sm">Care</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-primary px-3 py-1 scale-100 font-bold" href="/profile">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-label-sm text-label-sm">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
