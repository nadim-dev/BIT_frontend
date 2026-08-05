import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Droplet,
  HeartPulse,
  Hospital,
  LoaderCircle,
  Pill,
  Ticket,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getNotifications, readAllNotification } from "../api/notificationApi.js";

const notificationMeta = {
  System: {
    icon: Bell,
    iconClass: "bg-slate-100 text-slate-600",
  },
  "Blood Request": {
    icon: Droplet,
    iconClass: "bg-red-50 text-[#fb2c36]",
  },
  "Support Ticket": {
    icon: Ticket,
    iconClass: "bg-blue-50 text-blue-600",
  },
  Donation: {
    icon: HeartPulse,
    iconClass: "bg-rose-50 text-rose-600",
  },
  Hospital: {
    icon: Hospital,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  Medicine: {
    icon: Pill,
    iconClass: "bg-violet-50 text-violet-600",
  },
};

const fallbackMeta = {
  icon: Building2,
  iconClass: "bg-slate-100 text-slate-600",
};

const isSameDay = (firstDate, secondDate) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate();

const formatTimestamp = (value) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getSectionLabel = (value) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const NotificationPage = () => {
  const { setHeaderContent, unreadNotificationCount, setUnreadNotificationCount } =
    useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Notifications",
      subtitle: "Stay updated with your latest activities and important alerts.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getNotifications();
        setNotifications(response?.notifications || []);
      } catch (err) {
        setError(err.message || "Unable to load notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllNotifications();
  }, []);

  useEffect(() => {
    const readNotification = async () => {
      try {
        await readAllNotification();
        setUnreadNotificationCount(0);
      } catch (err) {
        console.log(err.message);
      }
    };

    if (unreadNotificationCount > 0 && notifications.length > 0) {
      readNotification();
    }
  }, [notifications.length, setUnreadNotificationCount, unreadNotificationCount]);

  const groupedNotifications = useMemo(() => {
    return notifications.reduce((groups, notification) => {
      const label = getSectionLabel(notification.createdAt);
      const existingGroup = groups.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.items.push(notification);
        return groups;
      }

      return [...groups, { label, items: [notification] }];
    }, []);
  }, [notifications]);

  return (
    <div className="px-3 py-6 font-['Inter','Plus_Jakarta_Sans',sans-serif] sm:px-5 lg:px-8">
      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-sm font-bold text-[#64748B] shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
          <LoaderCircle className="mr-2 size-5 animate-spin text-[#fb2c36]" />
          Loading notifications...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
          {error}
        </div>
      ) : groupedNotifications.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
          <p className="text-base font-extrabold text-[#0F172A]">
            No notifications yet
          </p>
          <p className="mt-2 text-sm font-medium text-[#64748B]">
            Important BIT updates will appear here.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-8">
          {groupedNotifications.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-sm font-extrabold tracking-normal text-[#0F172A]">
                {group.label}
              </h2>

              <div className="space-y-3">
                {group.items.map((notification) => {
                  const meta = notificationMeta[notification.type] || fallbackMeta;
                  const Icon = meta.icon;

                  return (
                    <article
                      key={notification._id}
                      className="relative flex gap-4 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.07)]"
                    >
                      <div className="flex shrink-0 items-start gap-2 pt-0.5">
                        {!notification.isRead ? (
                          <span className="mt-4 size-2 rounded-full bg-[#fb2c36]" />
                        ) : null}
                        <span
                          className={`flex size-11 items-center justify-center rounded-full ${meta.iconClass}`}
                        >
                          <Icon className="size-5" strokeWidth={2.15} />
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 pr-20">
                        <h3 className="text-sm font-extrabold leading-6 text-[#0F172A] sm:text-base">
                          {notification.title}
                        </h3>
                        <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-[#64748B]">
                          {notification.message}
                        </p>
                      </div>

                      <time className="absolute right-5 top-4 text-xs font-bold text-[#94A3B8]">
                        {formatTimestamp(notification.createdAt)}
                      </time>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
