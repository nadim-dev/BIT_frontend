import {Bell,Building2,Bike,CircleHelp,ClipboardList,Droplet,Droplets,Hospital,Inbox,LayoutDashboard,MessageSquareText,Settings,Siren,Ticket} from "lucide-react";
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
    show: (user) => user.role !== "Admin" && user.role !== "BloodBank",
  },
  {
    title: "My Requests",
    icon: ClipboardList,
    href: "/my-requests",
    show: (user) => user.role !== "Admin" && user.role !== "BloodBank",
  },
  {
    title: "My Tickets",
    icon: Ticket,
    href: "/my-tickets",
    show: (user) => user.role !== "Admin" && user.role !== "BloodBank",
  },
  {
    title: "Nearby Hospitals",
    icon: Hospital,
    href: "/nearby-hospitals",
    show: (user) => user.role !== "Admin" && user.role !== "BloodBank",
  },
  {
    title: "Nearby Blood Banks",
    icon: Droplets,
    href: "/nearby-blood-banks",
    show: (user) => user.role !== "Admin" && user.role !== "BloodBank",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
    show: (user) => user.role !== "BloodBank",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    show: (user) => user.role !== "Admin" && user.role !== "BloodBank",
  },
  {
    title: "Help & Support",
    icon: CircleHelp,
    href: "/support",
    show: (user) => user.role !== "Admin",
  },
];

const bloodBankMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/blood-bank/dashboard",
  },
  {
    title: "Requests",
    icon: ClipboardList,
    href: "/blood-bank/requests",
  },
  {
    title: "Inventory",
    icon: Droplet,
    href: "/blood-bank/inventory",
  },
  {
    title: "Dispatch",
    icon: Bike,
    href: "/blood-bank/dispatch",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Blood Bank Profile",
    icon: Building2,
    href: "/blood-bank/profile",
  },
  {
    title: "Help & Support",
    icon: CircleHelp,
    href: "/support",
  },
];

const adminMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Enquiries",
    icon: Inbox,
    href: "/admin/enquiries",
  },
  {
    title: "Tickets",
    icon: MessageSquareText,
    href: "/admin/tickets",
  },
    {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Blood Banks",
    icon: Droplets,
    href: "/admin/blood-banks",
  },
  {
    title:"Delivery Partners",
    icon:Bike,
    href:"/admin/delivery-partner"
  }
];


const getDisplayLocation = (currentUser) => {
  if (currentUser?.short_address) return currentUser.short_address;

  if (typeof currentUser?.location === "string") return currentUser.location;

  return "Bhiwandi, Maharashtra";
};

export const useDashboard = () => {
  const {currentUser}=useAuth();
  
  const user = {
    ...currentUser,
    username: currentUser?.username || currentUser?.name || "User",
    email: currentUser?.email || "",
    role: currentUser?.role || "User",
    location: getDisplayLocation(currentUser),
    bloodGroup: currentUser?.bloodGroup || "Unknown",
    isDonor: Boolean(currentUser?.isDonor),
    imageUrl: currentUser?.imageUrl || currentUser?.avatar || currentUser?.picture || "",
  };

  const roleMenuItems =
    user.role === "BloodBank"
      ? bloodBankMenuItems
      : user.role === "Admin"
        ? adminMenuItems
        : menuItems;

  const userMenu = roleMenuItems
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
