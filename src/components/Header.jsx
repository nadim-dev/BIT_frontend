import { Bell, ChevronDown, LogOut, MapPin } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutApi } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";
import getInitials from "../utils/getInitial";

export const Header = ({
  user,
  title,
  subtitle,
  action,
  leftContent,
  unreadNotificationCount = 0,
}) => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const username = user?.username || "User";
  const initials = getInitials(username);
  const shortLocation =
    user?.short_address || user?.location || "Bhiwandi, Maharashtra";
  const fullLocation = user?.long_address || shortLocation;

  const handleLogout = async () => {
    try {
      await logoutApi();
      setCurrentUser(null);
      navigate("/login");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-zinc-100 pb-3">
      <div>
        {leftContent || (
          <>
            {action ? (
              <Link
                to={action.to}
                className="mb-1.5 inline-flex cursor-pointer items-center gap-1.5 text-xs font-extrabold text-blue-600 transition hover:text-blue-700"
              >
                {action.icon ? <action.icon className="size-3.5" /> : null}
                {action.label}
              </Link>
            ) : null}

            {title ? (
                <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-zinc-950">
                  {title}
                </h1>
            ) : null}
            {subtitle ? (
                <p className="mt-0.5 text-xs text-[rgb(113,113,123)]">
                  {subtitle}
                </p>
            ) : null}
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-expanded={isLocationOpen}
          onClick={() => setIsLocationOpen((value) => !value)}
          className="relative flex h-9 max-w-64 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-800 shadow-sm transition hover:border-red-200 hover:bg-red-50"
        >
          <MapPin className="size-3.5 fill-[#fb2c36] text-[#fb2c36]" />
          <span className="min-w-0 truncate">{shortLocation}</span>
          <ChevronDown
            className={`size-3.5 shrink-0 text-[#71717b] transition-transform ${
              isLocationOpen ? "rotate-180" : ""
            }`}
          />
          {isLocationOpen ? (
            <span className="absolute left-0 top-12 z-50 w-72 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-xs font-semibold leading-relaxed text-zinc-700 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
              {fullLocation}
            </span>
          ) : null}
        </button>

        <Link
          to="/notifications"
          aria-label="Notifications"
          className="relative cursor-pointer grid size-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm transition hover:border-red-200 hover:bg-red-50"
        >
          <Bell className="size-4" />
          {unreadNotificationCount > 0 ? (
            <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#fb2c36] text-[9px] font-bold text-white">
              {unreadNotificationCount}
            </span>
          ) : null}
        </Link>

        <div className="relative">
          <button
            type="button"
            aria-expanded={isUserMenuOpen}
            onClick={() => setIsUserMenuOpen((value) => !value)}
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-zinc-200 bg-white pl-1 pr-2.5 shadow-sm transition hover:border-red-200 hover:bg-red-50"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={username}
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-7 place-items-center rounded-full bg-[#fb2c36] text-[11px] font-extrabold text-white">
                {initials}
              </span>
            )}
            <ChevronDown
              className={`size-3.5 text-[#71717b] transition-transform ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isUserMenuOpen ? (
            <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-2.5">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={username}
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-9 place-items-center rounded-full bg-[#fb2c36] text-xs font-extrabold text-white">
                    {initials}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-950">
                    {username}
                  </p>
                  <p className="truncate text-xs font-medium text-[#71717b]">
                    {user?.email || "No email available"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#fb2c36] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#d91f28]"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
