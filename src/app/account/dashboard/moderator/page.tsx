export default function ModeratorDashboardPage() {
  return (
    <section className="space-y-4">
      <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(8,17,37,0.94),rgba(5,11,31,0.98))] p-6">
        <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
          Moderation Overview
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">
          Review verification and client activity
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Manage KYC workflows, document reviews, and flagged events through one
          operational workspace.
        </p>
      </div>
    </section>
  );
}
