import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-16 mt-16">
          <main className="py-6 px-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
