import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import Sidebar from "../components/sidebar";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardLayout() {
  const { currentUser: user, userMenu } = useDashboard();

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <div className="flex min-h-screen w-full overflow-hidden bg-white">
        <Sidebar user={user} passUserMenu={userMenu} />

        <section className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <Header user={user} />
          <Outlet context={{ user }} />
        </section>
      </div>
    </main>
  );
}
