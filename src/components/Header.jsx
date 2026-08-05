import { Bell, ChevronDown, LogOut, MapPin, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutApi } from "../api/authApi";
import { updateDonorLocation } from "../api/donorApi";
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
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState("Not updated yet");
  const username = user?.username || "User";
  const initials = getInitials(username);
  const shortLocation =
    user?.short_address || user?.location || "Bhiwandi, Maharashtra";
  const fullLocation = user?.long_address || shortLocation;

  useEffect(() => {
    if (user?.updatedAt) {
      setLastUpdatedLabel("Recently updated");
    }
  }, [user?.updatedAt]);

  const handleLogout = async () => {
    try {
      await logoutApi();
      setCurrentUser(null);
      navigate("/login");
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleUseCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location detection is not supported in this browser.");
      return;
    }

    setIsUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          const response = await updateDonorLocation(coordinates);
          const updatedShortAddress = response?.short_address || shortLocation;

          setCurrentUser((currentUser) => ({
            ...currentUser,
            short_address: updatedShortAddress,
            location: updatedShortAddress,
          }));
          setLastUpdatedLabel("Just now");
          setIsLocationOpen(false);
        } catch (err) {
          setLocationError(err.message || "Unable to update location.");
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      () => {
        setLocationError("Please allow location access to update your location.");
        setIsUpdatingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
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
        <div className="relative">
          <button
            type="button"
            aria-expanded={isLocationOpen}
            onClick={() => setIsLocationOpen((value) => !value)}
            className="flex h-9 max-w-64 cursor-pointer items-center gap-1.5 rounded-full border border-red-100 bg-red-50/45 px-3 text-xs font-semibold text-zinc-900 shadow-sm transition hover:border-red-200 hover:bg-red-50"
          >
            <MapPin className="size-3.5 fill-[#fb2c36] text-[#fb2c36]" />
            <span className="min-w-0 truncate">{shortLocation}</span>
            <ChevronDown
              className={`size-3.5 shrink-0 text-[#71717b] transition-transform ${
                isLocationOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isLocationOpen ? (
            <div className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-zinc-200 bg-white p-2.5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.14)]">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 fill-[#fb2c36] text-[#fb2c36]" />
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold leading-4 text-zinc-950">
                    Location
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold leading-4 text-zinc-700">
                    {fullLocation}
                  </p>
                </div>
              </div>

              <div className="my-2 h-px bg-zinc-100" />

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isUpdatingLocation}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1.5 text-xs font-bold text-zinc-800 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-zinc-400"
              >
                <RefreshCw
                  className={`size-3.5 text-blue-500 ${
                    isUpdatingLocation ? "animate-spin" : ""
                  }`}
                />
                {isUpdatingLocation ? "Updating..." : "Use current location"}
              </button>

              {locationError ? (
                <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-[11px] font-bold leading-4 text-red-600">
                  {locationError}
                </p>
              ) : null}

              <div className="mt-2 border-t border-zinc-100 pt-2">
                <p className="text-[10px] font-bold leading-4 text-zinc-500">
                  Updated: {lastUpdatedLabel}
                </p>
              </div>
            </div>
          ) : null}
        </div>

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
