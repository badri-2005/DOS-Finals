"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title={title} subtitle={subtitle} />
        <div style={{ padding: "28px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
