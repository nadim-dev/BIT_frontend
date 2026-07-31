import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Header } from "../components/Header";
import Sidebar from "../components/sidebar";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardLayout() {
  const { currentUser: user, userMenu } = useDashboard();
  const [headerContent, setHeaderContent] = useState({
    title: undefined,
    subtitle: undefined,
    action: undefined,
  });

  return (
    <main className="h-screen overflow-hidden bg-white text-zinc-950">
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <Sidebar user={user} passUserMenu={userMenu} />

        <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
          <Header
            user={user}
            title={headerContent.title}
            subtitle={headerContent.subtitle}
            action={headerContent.action}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet context={{ user, setHeaderContent }} />
          </div>
        </section>
      </div>
    </main>
  );
}
