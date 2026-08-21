import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { AlertTriangle, Bell, Building2, ChevronRight, Droplet, FileText, HeartPulse, Hourglass, LoaderCircle, Pill, Ticket, TrendingDown, TrendingUp } from "lucide-react";
import {
  getIncomingBloodBankRequests,
  getMyBloodBankProfile,
} from "../../api/bloodBankApi";
import { getNotifications } from "../../api/notificationApi";
import { formatTicketDate } from "../../utils/dateCustomization";

const LOW_STOCK_LIMIT = 5;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const requestStatusClass = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

const isWithinLastSevenDays = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return Date.now() - date.getTime() <= SEVEN_DAYS_MS;
};

const getDaysUntilExpiry = (value) => {
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

const formatExpiry = (days) => `Expires in ${days} day${days === 1 ? "" : "s"}`;

const getTotalUnits = (items = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0), 0);

const getRequestItemsLabel = (items = []) => {
  if (!items.length) return "Items unavailable";
  return items
    .map((item) => [item.bloodGroup, item.component].filter(Boolean).join(" "))
    .filter(Boolean)
    .join(", ");
};

const getRequesterName = (request = {}) =>
  request.patient?.name || request.userId?.username || "Requester unavailable";

const getDisplayStatus = (request = {}) =>
  request.deliveryStatus === "ReadyToDispatch" ? "Ready" : request.requestStatus || "Pending";

const getStatusClass = (request = {}) =>
  request.deliveryStatus === "ReadyToDispatch"
    ? "bg-blue-50 text-blue-700"
    : requestStatusClass[request.requestStatus] || requestStatusClass.Pending;

const notificationMeta = {
  System: { icon: Bell, iconClass: "bg-slate-100 text-slate-600" },
  "Blood Request": { icon: Droplet, iconClass: "bg-red-50 text-red-600" },
  "Support Ticket": { icon: Ticket, iconClass: "bg-blue-50 text-blue-600" },
  "Blood Bank": { icon: Building2, iconClass: "bg-red-50 text-red-600" },
  Donation: { icon: HeartPulse, iconClass: "bg-rose-50 text-rose-600" },
  Hospital: { icon: Building2, iconClass: "bg-emerald-50 text-emerald-600" },
  Medicine: { icon: Pill, iconClass: "bg-violet-50 text-violet-600" },
};

const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

export const BloodBankDashbaord=()=>{
    const {setHeaderContent } = useOutletContext();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [bloodBank, setBloodBank] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    

    useEffect(() => {
        setHeaderContent({
          title: "Blood Bank Operator",
          subtitle: "Overview of your blood bank operations",
          action: undefined,
        });
      }, [setHeaderContent]);

      useEffect(() => {
        let isMounted = true;

        const loadDashboard = async () => {
          try {
            setIsLoading(true);
            setError("");

            const [requestResponse, profileResponse, notificationResponse] = await Promise.all([
              getIncomingBloodBankRequests(),
              getMyBloodBankProfile(),
              getNotifications(),
            ]);

            if (!isMounted) return;

            setRequests(requestResponse?.bloodRequests || []);
            setBloodBank(profileResponse?.bloodBank || null);
            setNotifications((notificationResponse?.notifications || []).slice(0, 5));
          } catch (dashboardError) {
            if (isMounted) {
              setError(dashboardError?.response?.data?.message || "Unable to load blood bank dashboard.");
            }
          } finally {
            if (isMounted) setIsLoading(false);
          }
        };

        loadDashboard();

        return () => {
          isMounted = false;
        };
      }, []);

      const dashboardStats = useMemo(() => {
        const inventory = (bloodBank?.inventory || []).map((item) => ({
          ...item,
          unitsAvailable: Number(item.unitsAvailable || 0),
        }));

        const totalRequests = requests.length;
        const pendingRequests = requests.filter((request) => request.requestStatus === "Pending").length;
        const recentRequests = requests.filter((request) => isWithinLastSevenDays(request.createdAt)).length;
        const recentPendingRequests = requests.filter(
          (request) => request.requestStatus === "Pending" && isWithinLastSevenDays(request.createdAt),
        ).length;
        const availableUnits = inventory.reduce((total, item) => total + item.unitsAvailable, 0);
        const availableGroups = inventory.filter((item) => item.unitsAvailable > LOW_STOCK_LIMIT).length;
        const lowStockGroups = inventory.filter((item) => item.unitsAvailable > 0 && item.unitsAvailable <= LOW_STOCK_LIMIT).length;

        return {
          totalRequests,
          pendingRequests,
          recentRequests,
          recentPendingRequests,
          availableUnits,
          availableGroups,
          lowStockGroups,
        };
      }, [bloodBank?.inventory, requests]);

      const statCards = [
        {
          label: "Total Requests",
          value: dashboardStats.totalRequests,
          helper: "from last 7 days",
          icon: FileText,
          iconWrap: "bg-red-50 text-red-600 ring-red-100",
          iconClass: "",
          trend: "up",
          trendText: dashboardStats.recentRequests,
          trendTone: "text-emerald-600",
        },
        {
          label: "Pending Requests",
          value: dashboardStats.pendingRequests,
          helper: "from last 7 days",
          icon: Hourglass,
          iconWrap: "bg-orange-50 text-orange-500 ring-orange-100",
          iconClass: "",
          trend: "up",
          trendText: dashboardStats.recentPendingRequests,
          trendTone: "text-orange-500",
        },
        {
          label: "Available Units",
          value: dashboardStats.availableUnits,
          helper: "groups in stock",
          icon: Droplet,
          iconWrap: "bg-violet-50 text-violet-600 ring-violet-100",
          iconClass: "",
          trend: "up",
          trendText: dashboardStats.availableGroups,
          trendTone: "text-emerald-600",
        },
        {
          label: "Low Stock Groups",
          value: dashboardStats.lowStockGroups,
          helper: "need review",
          icon: AlertTriangle,
          iconWrap: "bg-rose-50 text-red-500 ring-rose-100",
          iconClass: "",
          trend: "down",
          trendText: dashboardStats.lowStockGroups,
          trendTone: "text-red-500",
        },
      ];

      const inventorySummary = useMemo(() => {
        const grouped = new Map(BLOOD_GROUPS.map((bloodGroup) => [bloodGroup, { units: 0, low: false }]));
        const expiring = [];

        (bloodBank?.inventory || []).forEach((item) => {
          const units = Number(item.unitsAvailable || 0);
          const current = grouped.get(item.bloodGroup);
          if (current) {
            current.units += units;
            current.low = current.low || (units > 0 && units <= LOW_STOCK_LIMIT);
          }

          const days = getDaysUntilExpiry(item.expiryDate);
          if (units > 0 && days !== null && days >= 0 && days <= 7) {
            expiring.push({ ...item, units, days });
          }
        });

        return {
          groups: BLOOD_GROUPS.map((bloodGroup) => ({ bloodGroup, ...grouped.get(bloodGroup) })),
          expiring: expiring.sort((a, b) => a.days - b.days).slice(0, 4),
        };
      }, [bloodBank?.inventory]);

      const componentSummary = useMemo(() => {
        const totals = { PRBC: 0, Platelets: 0, Plasma: 0 };
        (bloodBank?.inventory || []).forEach((item) => {
          const component = item.type || item.component;
          if (component in totals) totals[component] += Number(item.unitsAvailable || 0);
        });

        const total = Object.values(totals).reduce((sum, units) => sum + units, 0);
        return Object.entries(totals).map(([label, units]) => ({
          label,
          units,
          percentage: total ? ((units / total) * 100).toFixed(1) : "0.0",
        }));
      }, [bloodBank?.inventory]);

      const recentRequests = useMemo(
        () =>
          [...requests]
            .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
            .slice(0, 5),
        [requests],
      );
     
    
    

    return(
        <section className="flex flex-col space-y-4 py-4">
          {error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              const TrendIcon = card.trend === "down" ? TrendingDown : TrendingUp;
              
              return (
                <div
                  key={card.label}
                  className="relative min-h-[124px] overflow-hidden rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <span className={`absolute left-0 top-0 h-full w-1 ${card.trend === "down" ? "bg-red-500" : "bg-emerald-500"}`} />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold leading-5 text-slate-600">
                        {card.label}
                      </p>
                      <p className="mt-3 text-[34px] font-black leading-none tracking-normal text-slate-950">
                        {isLoading ? (
                          <LoaderCircle className="h-7 w-7 animate-spin text-slate-300" />
                        ) : (
                          String(card.value).padStart(2, "0")
                        )}
                      </p>
                    </div>

                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ring-1 ${card.iconWrap}`}>
                      <Icon className={`h-5 w-5 ${card.iconClass}`} strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="mt-4 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs font-bold text-slate-500">
                      <span className={`inline-flex items-center gap-1 font-black ${card.trendTone}`}>
                        <TrendIcon className="h-3.5 w-3.5" strokeWidth={3} />
                        {card.trendText}
                      </span>
                      {card.helper}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="order-last overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-extrabold text-slate-900">Recent Blood Requests</h2>
              <Link to="/blood-bank/requests" className="inline-flex items-center gap-1 text-xs font-extrabold text-red-600 hover:text-red-700">
                View All Requests <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Patient / User</th>
                    <th className="px-4 py-3">Blood Items</th>
                    <th className="px-4 py-3 text-center">Units</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Requested On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm font-semibold text-slate-400">
                        Loading recent requests...
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading && recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm font-semibold text-slate-400">
                        No blood requests yet.
                      </td>
                    </tr>
                  ) : null}

                  {recentRequests.map((request) => (
                    <tr key={request._id} className="text-xs font-bold text-slate-600">
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-black text-slate-700">
                        {request.requestNumber || "Unavailable"}
                      </td>
                      <td className="max-w-[180px] px-4 py-3 font-black text-slate-800">
                        <span className="block truncate">{getRequesterName(request)}</span>
                      </td>
                      <td className="max-w-[220px] px-4 py-3">
                        <span className="block truncate">{getRequestItemsLabel(request.items)}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-slate-800">
                        {getTotalUnits(request.items)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${getStatusClass(request)}`}>
                          {getDisplayStatus(request)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {formatTicketDate(request.createdAt, "Not available")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!isLoading && requests.length > 0 ? (
              <div className="border-t border-slate-100 px-4 py-3 text-center text-xs font-extrabold text-slate-400">
                Showing {recentRequests.length} of {requests.length} request{requests.length === 1 ? "" : "s"}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-extrabold text-slate-900">Inventory by Blood Group</h2>
                <Link to="/blood-bank/inventory" className="inline-flex items-center gap-1 text-xs font-extrabold text-red-600 hover:text-red-700">
                  View Inventory <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4">
                {inventorySummary.groups.map((group) => (
                  <div key={group.bloodGroup} className="border-b border-r border-slate-100 px-4 py-4 last:border-r-0 sm:nth-[4n]:border-r-0">
                    <div className="flex items-center gap-2">
                      <Droplet className="h-5 w-5 shrink-0 fill-red-500 text-red-500" strokeWidth={1.5} />
                      <span className="text-sm font-extrabold text-slate-800">{group.bloodGroup}</span>
                    </div>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-extrabold ${group.low ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                      {isLoading ? "Loading" : `${group.units} units`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-extrabold text-slate-900">Expiring Soon <span className="font-semibold text-slate-400">(Next 7 Days)</span></h2>
                <Link to="/blood-bank/inventory" className="text-xs font-extrabold text-red-600 hover:text-red-700">View All</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {isLoading ? <p className="px-4 py-6 text-sm font-semibold text-slate-400">Loading inventory...</p> : null}
                {!isLoading && inventorySummary.expiring.length === 0 ? <p className="px-4 py-6 text-sm font-semibold text-slate-400">No inventory expires in the next 7 days.</p> : null}
                {inventorySummary.expiring.map((item) => (
                  <div key={item._id || `${item.bloodGroup}-${item.type}-${item.expiryDate}`} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600"><Droplet className="h-4 w-4 fill-current" /></span>
                    <div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-slate-800">{item.bloodGroup} <span className="ml-2 font-semibold text-slate-500">{item.type}</span></p></div>
                    <div className="text-right"><p className="text-sm font-extrabold text-slate-800">{item.units} units</p><p className="text-xs font-bold text-red-600">{formatExpiry(item.days)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">Inventory by Component</h2>
              <div className="mt-5 flex items-center justify-center gap-6 sm:gap-10">
                <div
                  className="grid h-48 w-48 shrink-0 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#ef1f2f 0% ${componentSummary[0]?.percentage || 0}%, #f59e0b ${componentSummary[0]?.percentage || 0}% ${(Number(componentSummary[0]?.percentage || 0) + Number(componentSummary[1]?.percentage || 0)).toFixed(1)}%, #7048e8 ${(Number(componentSummary[0]?.percentage || 0) + Number(componentSummary[1]?.percentage || 0)).toFixed(1)}% 100%)`,
                  }}
                >
                  <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center">
                    <div><p className="text-3xl font-black leading-none text-slate-900">{isLoading ? "-" : componentSummary.reduce((sum, item) => sum + item.units, 0)}</p><p className="mt-1 text-sm font-bold text-slate-500">Total Units</p></div>
                  </div>
                </div>
                <div className="space-y-3">
                  {componentSummary.map((item, index) => (
                    <div key={item.label} className="flex items-start gap-2">
                      <span className={`mt-1.5 h-3 w-3 rounded-full ${index === 0 ? "bg-red-500" : index === 1 ? "bg-amber-500" : "bg-violet-600"}`} />
                      <div><p className="text-base font-extrabold text-slate-800">{item.label}</p><p className="text-sm font-semibold text-slate-500">{item.units} units ({item.percentage}%)</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900">Recent Activity</h2>
              <div className="mt-3 divide-y divide-slate-100">
                {isLoading ? <p className="py-5 text-sm font-semibold text-slate-400">Loading activity...</p> : null}
                {!isLoading && notifications.length === 0 ? <p className="py-5 text-sm font-semibold text-slate-400">No recent activity.</p> : null}
                {notifications.map((notification) => {
                  const meta = notificationMeta[notification.type] || notificationMeta.System;
                  const Icon = meta.icon;
                  return (
                    <div
                      key={notification._id}
                      className="flex cursor-pointer items-center gap-3 py-3 first:pt-1 last:pb-1"
                      onClick={() => {
                        if (notification.actionUrl) navigate(notification.actionUrl);
                      }}
                      role={notification.actionUrl ? "link" : undefined}
                      tabIndex={notification.actionUrl ? 0 : undefined}
                      onKeyDown={(event) => {
                        if (notification.actionUrl && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          navigate(notification.actionUrl);
                        }
                      }}
                    >
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.iconClass}`}><Icon className="h-4 w-4" strokeWidth={2.4} /></span>
                      <div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold text-slate-800">{notification.title}</p><p className="truncate text-[11px] font-semibold text-slate-500">{notification.message}</p></div>
                      <time className="shrink-0 text-[11px] font-bold text-slate-400">{formatRelativeTime(notification.createdAt)}</time>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
    )
}
