export default function Loading() {
  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(5,11,31,0.98))] p-7 shadow-[0_32px_80px_rgba(0,0,0,0.34)] sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-[1.35rem] border border-white/12 bg-white/10" />
          <div className="mt-5 h-3 w-28 rounded-full bg-white/10" />
          <div className="mt-3 h-8 w-3/4 rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-full max-w-sm rounded-full bg-white/10" />
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-12 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="h-12 rounded-2xl border border-white/10 bg-white/[0.04]" />
          <div className="h-12 rounded-2xl border border-white/10 bg-white/[0.04]" />
        </div>

        <div className="mt-6 border-t border-white/8 pt-5">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-3 w-56 rounded-full bg-white/10" />
            <div className="mx-auto h-3 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
