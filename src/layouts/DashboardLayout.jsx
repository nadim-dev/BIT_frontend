import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Droplet } from "lucide-react";
import { Header } from "../components/Header";
import Sidebar from "../components/sidebar";
import { useDashboard } from "../hooks/useDashboard";
import { getUnreadNotificationCount } from "../api/notificationApi";
import { io } from "socket.io-client";


export default function DashboardLayout() {
  const { currentUser: user, userMenu } = useDashboard();
  const { pathname } = useLocation();
  const hideSidebar = pathname === "/become-donor";
  
  const [headerContent, setHeaderContent] = useState({
    title: undefined,
    subtitle: undefined,
    action: undefined,
  });

  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [deliveryPartnerSocket, setDeliveryPartnerSocket] = useState(null);

  useEffect(() => {
    const fetchUnreadNotificationCount = async () => {
      try {
        const {unreadCount}= await getUnreadNotificationCount();
        console.log("UnreadCount",unreadCount);
        setUnreadNotificationCount(unreadCount);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchUnreadNotificationCount();
  }, []);


  useEffect(() => {
    if (!user?._id || !["DeliveryPartner", "BloodBank", "User","Donor"].includes(user.role)) {
      setDeliveryPartnerSocket(null);
      return;
    }

    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });

    setDeliveryPartnerSocket(socket);

    socket.on("connect", () => {
      console.log(`${user.role} socket connected:`, socket.id);
    });

    socket.on("newNotification", () => {
      setUnreadNotificationCount((currentCount) => currentCount + 1);
    });

    socket.on("disconnect", (reason) => {
      console.log(`${user.role} socket disconnected:`, reason);
    });

    return () => {
      setDeliveryPartnerSocket(null);
      socket.off("newNotification");
      socket.disconnect();
    };
  }, [user?._id, user?.role]);


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
        {hideSidebar ? null : <Sidebar user={user} unreadNotificationCount={unreadNotificationCount}  passUserMenu={userMenu} />}

        <section className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
          <Header
            user={user}
            title={headerContent.title}
            subtitle={headerContent.subtitle}
            action={headerContent.action}
            leftContent={hideSidebar ? donorHeaderBrand : null}
            unreadNotificationCount={unreadNotificationCount}
          />
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet context={{ user, setHeaderContent,unreadNotificationCount, setUnreadNotificationCount, deliveryPartnerSocket}} />
          </div>
        </section>
      </div>
    </main>
  );
}
