export default function Loading() {
  return (
    <div className="space-y-4 px-4 py-6 md:px-6">
      <div className="h-8 w-48 animate-pulse rounded-2xl bg-muted" />
      <div className="h-44 animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
      <div className="h-48 animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
    </div>
  );
}
