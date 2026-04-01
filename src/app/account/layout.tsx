export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-full flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
