import {Bell,Ticket,Droplet,CircleHelp,ClipboardList,Droplets,Hospital,Inbox,LayoutDashboard,MessageSquareText,Settings,Siren} from "lucide-react";
import { useAuth } from "./useAuth";
import { getDashboardPath } from "../utils/dashboardRoutes";


const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: (user) => getDashboardPath(user.role),
  },
  {
    title: "Emergency Help",
    icon: Siren,
    href: "/emergency",
    show: (user) => user.role !== "Admin",
  },
  {
    title: "My Requests",
    icon: ClipboardList,
    href: "/requests",
    show: (user) => user.role !== "Admin",
  },
  {
    title: "My Tickets",
    icon: Ticket,
    href: "/my-tickets",
    show: (user) => user.role !== "Admin",
  },
  {
    title: "Enquiries",
    icon: Inbox,
    href: "/admin/enquiries",
    show: (user) => user.role === "Admin",
  },
  {
    title: "Tickets",
    icon: MessageSquareText,
    href: "/admin/tickets",
    show: (user) => user.role === "Admin",
  },
  {
    title: "Nearby Hospitals",
    icon: Hospital,
    href: "/nearby-hospitals",
    show: (user) => user.role !== "Admin",
  },
  {
    title: "Nearby Blood Banks",
    icon: Droplets,
    href: "/nearby-blood-banks",
    show: (user) => user.role !== "Admin",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    show: (user) => user.role !== "Admin",
  },
  {
  title: "Blood Banks",
  icon: Droplets,
  href: "/admin/blood-banks",
  show: (user) => user?.role === "Admin",
  },
  {
    title: "Help & Support",
    icon: CircleHelp,
    href: "/support",
    show: (user) => user.role !== "Admin",
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

  const userMenu = menuItems
    .filter((item) => !item.show || item.show(user))
    .map((item) => ({
      ...item,
      href: typeof item.href === "function" ? item.href(user) : item.href,
    }));

  return {
    currentUser: user,
    userMenu,
  };
};
