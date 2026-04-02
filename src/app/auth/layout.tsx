import { Navbar } from "@/components/layout/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-site-shell flex min-h-screen flex-col text-foreground">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex w-full max-w-7xl flex-1 items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
