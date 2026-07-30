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
  });

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="flex min-h-screen w-full overflow-hidden bg-white">
        <Sidebar user={user} passUserMenu={userMenu} />

        <section className="flex min-w-0 flex-1 flex-col px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
          <Header
            user={user}
            title={headerContent.title}
            subtitle={headerContent.subtitle}
          />
          <Outlet context={{ user, setHeaderContent }} />
        </section>
      </div>
    </main>
  );
}
