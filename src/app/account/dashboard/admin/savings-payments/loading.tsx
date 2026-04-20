export default function Loading() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-6">
      <div className="h-10 w-56 animate-pulse rounded-2xl bg-muted" />
      <div className="h-64 animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
    </div>
  );
}
