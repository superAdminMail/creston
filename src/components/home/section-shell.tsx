import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
};

export function SectionShell({
  id,
  children,
  className,
  innerClassName,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("relative scroll-mt-32", className)}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", innerClassName)}>
        {children}
      </div>
    </section>
  );
}
