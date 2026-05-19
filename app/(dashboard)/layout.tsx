export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-scrapbook-50">
      {children}
    </div>
  );
}
