export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="rounded-2xl bg-slate-100 px-3 py-2 dark:bg-white/5">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400/70 [animation-delay:0ms] dark:bg-muted-foreground/60" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400/70 [animation-delay:120ms] dark:bg-muted-foreground/60" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400/70 [animation-delay:240ms] dark:bg-muted-foreground/60" />
        </div>
      </div>
    </div>
  );
}
