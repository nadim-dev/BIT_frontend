import { ChevronRight, Droplet, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import getInitials from "../utils/getInitial";

export default function Sidebar({ user,unreadNotificationCount, passUserMenu = [] }) {
  return (
    <aside className="hidden w-[238px] shrink-0 bg-[linear-gradient(180deg,#8f0000_0%,#b80d12_48%,#860000_100%)] p-3 text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-2 px-1 py-2">
        <div className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/12 shadow-lg shadow-black/10">
          <Droplet className="size-6 fill-white text-white" />
        </div>
        <div>
          <p className="text-xl font-extrabold leading-6 tracking-tight">BIT</p>
          <p className="text-xs font-medium text-white/75">Blood In Time</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1">
        {passUserMenu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.href}
              end={item.href === "/support"}
              className={({ isActive }) =>
                [
                  "group flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-white text-[#a60000] shadow-lg shadow-black/15"
                    : "text-white/88 hover:bg-white/12 hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "flex size-7 items-center justify-center rounded-lg transition",
                      isActive
                        ? "bg-[#fb2c36]/10 text-[#fb2c36]"
                        : "bg-white/10 text-white group-hover:bg-white/15",
                    ].join(" ")}
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.title}</span>
                  {item.badge ? (
                    <span
                      className={[
                        "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs font-bold",
                        isActive
                          ? "bg-[#fb2c36] text-white"
                          : "bg-white text-[#b40000]",
                      ].join(" ")}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3">
        <NavLink
          to="/profile"
          className="block rounded-2xl border border-white/15 bg-white/10 p-2 shadow-xl shadow-black/10 backdrop-blur transition hover:bg-white/15"
        >
          <div className="flex items-center gap-2">
            {user?.picture ? <img
              src={user.picture || "https://i.pravatar.cc/96?img=12"}
              alt={user.username}
              className="size-10 rounded-xl border-2 border-white/70 object-cover"
            /> : getInitials(user.username)}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user.username}</p>
              <p className="mt-0.5 text-xs font-medium text-white/75">
                View Profile
              </p>
            </div>
            <ChevronRight className="size-4 text-white/75" />
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
