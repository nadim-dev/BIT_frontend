import {Bell,CircleAlert,Building2,BrainCircuit,Wallet,UsersRound,PackageCheck,Cross,Bike,CircleHelp,ClipboardList,Droplet,Droplets,Hospital,Inbox,LayoutDashboard,MessageSquareText,Settings,Siren,Ticket} from "lucide-react";
import { useAuth } from "./useAuth";
import { getDashboardPath } from "../utils/dashboardRoutes";


const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: (user) => getDashboardPath(user.role),
  },
  {
    title: "My Requests",
    icon: ClipboardList,
    href: "/my-requests"
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
  },
  {
    title: "Nearby Blood Banks",
    icon: Droplets,
    href: "/nearby-blood-banks",
  },
  {
    title:"Nearby Donors",
    icon: UsersRound,
    href:"/nearby-donors"
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
  },
  {
    title: "Help & Support",
    icon: CircleHelp,
    href: "/support",
  },
];

const bloodBankMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/blood-bank/dashboard",
  },
  {
    title: "Blood Requests",
    icon: ClipboardList,
    href: "/blood-bank/requests",
  },
  {
    title: "Inventory",
    icon: Droplet,
    href: "/blood-bank/inventory",
  },
  {
    title: "AI Demand Prediction",
    icon: BrainCircuit,
    href: "/blood-bank/ai-demand-prediction",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "My Issues",
    icon: CircleAlert,
    href: "/my-tickets",
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
    title:"Users",
    icon:UsersRound,
    href:"/users"
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
  },
  {
   title: "Hospitals",
   icon: Building2,
   href: "/admin/hospitals",
  }
];

const DeliveryPartnerMenuItems=[
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: (user) => getDashboardPath(user.role),
  },
  {
    title: "Delivery Requests",
    icon: ClipboardList,
    href: "/delivery-partner/request",
  },
  {
  title: "My Deliveries",
  icon: PackageCheck,
  href: "/my-deliveries",
},
{
  title: "Earnings",
  icon: Wallet,
  href: "/earnings",
},
  {
    title: "My Tickets",
    icon: Ticket,
    href: "/my-tickets",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
  },
  {
    title: "Help & Support",
    icon: CircleHelp,
    href: "/support",
  },
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
        : user.role == "DeliveryPartner" ?  DeliveryPartnerMenuItems  : menuItems;

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
