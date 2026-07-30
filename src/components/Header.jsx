import { Bell, ChevronDown, LogOut, MapPin } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutApi } from "../api/authApi";
import getInitials from "../utils/getInitial";


export const Header = ({ user,title,subtitle}) => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const username = user?.username || "User";
  const firstName = username.split(" ")[0];
  const initials = getInitials(username);
  const shortLocation = user?.short_address || user?.location || "Bhiwandi, Maharashtra";
  const fullLocation = user?.long_address || shortLocation;

  const handleLogout = async () => {
    try{
        await logoutApi();
       setCurrentUser(null);
       navigate("/login");
    }catch(err){
        console.log(err.message);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-zinc-100 pb-4">
      <div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950">
          {title || `Welcome back, ${firstName}! 👋`}
        </h1>
        <p className="mt-1 text-sm text-[rgb(113,113,123)]">
          {subtitle || "Every good act brings hope."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-expanded={isLocationOpen}
          onClick={() => setIsLocationOpen((value) => !value)}
          className="cursor-pointer relative flex h-11 max-w-72 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-red-200 hover:bg-red-50"
        >
          <MapPin className="size-4 fill-[#fb2c36] text-[#fb2c36]" />
          <span className="min-w-0 truncate">{shortLocation}</span>
          <ChevronDown
            className={`size-4 shrink-0 text-[#71717b] transition-transform ${
              isLocationOpen ? "rotate-180" : ""
            }`}
          />
          {isLocationOpen && (
            <span className="absolute left-0 top-14 z-50 w-80 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-xs font-semibold leading-relaxed text-zinc-700 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
              {fullLocation}
            </span>
          )}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-800 shadow-sm transition hover:border-red-200 hover:bg-red-50"
        >
          <Bell className="size-5" />
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#fb2c36] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            aria-expanded={isUserMenuOpen}
            onClick={() => setIsUserMenuOpen((value) => !value)}
            className="cursor-pointer flex h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white pl-1.5 pr-3 shadow-sm transition hover:border-red-200 hover:bg-red-50"
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={username}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-8 place-items-center rounded-full bg-[#fb2c36] text-xs font-extrabold text-white">
                {initials}
              </span>
            )}
            <ChevronDown
              className={`size-4 text-[#71717b] transition-transform ${
                isUserMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={username}
                    className="size-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-11 place-items-center rounded-full bg-[#fb2c36] text-sm font-extrabold text-white">
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
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#fb2c36] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#d91f28]"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
