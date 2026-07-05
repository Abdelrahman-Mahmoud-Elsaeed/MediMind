export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">MediMind</p>
        <h1 className="text-3xl font-semibold">Medication management for patients and caregivers</h1>
        <p className="max-w-2xl text-lg text-slate-600">
          This starter shell now reflects the planned Next.js module structure and route layout.
        </p>
      </div>
    </main>
  );
}