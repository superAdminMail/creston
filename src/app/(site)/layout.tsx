import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-site-shell flex min-h-screen flex-col text-foreground">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-full flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
