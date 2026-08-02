import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Droplet } from "lucide-react";
import { Header } from "../components/Header";
import Sidebar from "../components/sidebar";
import { useDashboard } from "../hooks/useDashboard";

export default function DashboardLayout() {
  const { currentUser: user, userMenu } = useDashboard();
  const { pathname } = useLocation();
  const hideSidebar = pathname === "/become-donor";
  const [headerContent, setHeaderContent] = useState({
    title: undefined,
    subtitle: undefined,
    action: undefined,
  });
  const donorHeaderBrand = (
    <div className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-[#fb2c36] text-white shadow-sm">
        <Droplet className="size-5 fill-white text-white" />
      </span>
      <div>
        <p className="text-base font-extrabold leading-5 text-zinc-950">BIT</p>
        <p className="text-[11px] font-semibold leading-4 text-zinc-500">
          Blood In Time
        </p>
      </div>
    </div>
  );

  return (
    <main className="h-screen overflow-hidden bg-white text-zinc-950">
      <div className="flex h-screen w-full overflow-hidden bg-white">
        {hideSidebar ? null : <Sidebar user={user} passUserMenu={userMenu} />}

        <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
          <Header
            user={user}
            title={headerContent.title}
            subtitle={headerContent.subtitle}
            action={headerContent.action}
            leftContent={hideSidebar ? donorHeaderBrand : null}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet context={{ user, setHeaderContent }} />
          </div>
        </section>
      </div>
    </main>
  );
}
