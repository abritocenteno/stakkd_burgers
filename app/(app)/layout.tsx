import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar — hidden on desktop */}
        <TopBar />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav — hidden on desktop */}
        <BottomNav />
      </div>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
