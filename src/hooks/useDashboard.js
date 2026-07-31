import {Bell,Ticket,CircleHelp,ClipboardList,Droplets,HeartHandshake,Hospital,LayoutDashboard,Settings,Siren,User} from "lucide-react";
import { useAuth } from "./useAuth";


const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/user/dashboard",
  },
  {
    title: "Emergency Help",
    icon: Siren,
    href: "/emergency",
  },
  {
    title: "My Requests",
    icon: ClipboardList,
    href: "/requests",
  },
  {
  title: "My Tickets",
  icon: Ticket,
  href: "/my-tickets",
  },
  {
    title: "Nearby Hospitals",
    icon: Hospital,
    href: "/nearby-hospitals",
  },
  {
    title: "Nearby Blood Banks",
    icon: Droplets,
    href: "/nearby-blood-banks",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
    badge: 3,
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Help & Support",
    icon: CircleHelp,
    href: "/support",
  },
];

export const useDashboard = () => {
  const {currentUser}=useAuth()
  const user = {
    ...currentUser,
    username: currentUser?.username || currentUser?.name || "User",
    email: currentUser?.email || "",
    role: currentUser?.role || "User",
    location: currentUser?.short_address || currentUser?.location || "Bhiwandi, Maharashtra",
    bloodGroup: currentUser?.bloodGroup || "Unknown",
    isDonor: Boolean(currentUser?.isDonor),
    imageUrl: currentUser?.imageUrl || currentUser?.avatar || "",
  };

  const userMenu = menuItems.filter((item) => !item.show || item.show(user));

  return {
    currentUser: user,
    userMenu,
  };
};
