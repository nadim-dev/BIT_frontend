import React, { useEffect, useMemo, useState } from "react";
import {Ambulance,Building2,CalendarDays,CheckCircle2,ChevronDown,ChevronRight,CircleHelp,Clock3,Droplet,HeartPulse,Laptop,LoaderCircle,LockKeyhole,Pill,RefreshCw,Search,Sparkles,Ticket,UserRound} from  "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { getMyTicketsAll } from "../api/supportTicketApi";

const categories = [
  "Blood Services",
  "Medicine Services",
  "Ambulance Booking",
  "Hospital Services",
  "Account & Profile",
  "Login & Security",
  "AI Prediction",
  "Technical Issue",
  "Feature Request",
  "Other",
];

const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

const statusMeta = {
  Open: {
    icon: Clock3,
    dotClass: "bg-orange-400",
    badgeClass: "bg-orange-100/85 text-orange-600 shadow-[0_6px_16px_rgba(251,146,60,0.16)]",
    softClass: "border-orange-100 bg-orange-50/20",
    statIconClass: "bg-orange-100 text-orange-500",
  },
  "In Progress": {
    icon: RefreshCw,
    dotClass: "bg-blue-500",
    badgeClass: "bg-blue-100/85 text-blue-600 shadow-[0_6px_16px_rgba(59,130,246,0.16)]",
    softClass: "border-blue-100 bg-blue-50/25",
    statIconClass: "bg-blue-100 text-blue-500",
  },
  Resolved: {
    icon: CheckCircle2,
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-100/85 text-emerald-600 shadow-[0_6px_16px_rgba(16,185,129,0.16)]",
    softClass: "border-emerald-100 bg-emerald-50/25",
    statIconClass: "bg-emerald-100 text-emerald-600",
  },
  Closed: {
    icon: CheckCircle2,
    dotClass: "bg-slate-500",
    badgeClass: "bg-slate-100 text-slate-600 shadow-[0_6px_16px_rgba(100,116,139,0.12)]",
    softClass: "border-slate-100 bg-slate-50/50",
    statIconClass: "bg-slate-100 text-slate-600",
  },
};

const categoryMeta = {
  "Blood Services": {
    icon: Droplet,
    iconClass: "bg-blue-100 text-blue-500 shadow-[inset_0_0_0_10px_rgba(239,246,255,0.9)]",
  },
  "Medicine Services": {
    icon: Pill,
    iconClass: "bg-violet-100 text-violet-500 shadow-[inset_0_0_0_10px_rgba(245,243,255,0.9)]",
  },
  "Ambulance Booking": {
    icon: Ambulance,
    iconClass: "bg-emerald-100 text-emerald-600 shadow-[inset_0_0_0_10px_rgba(236,253,245,0.9)]",
  },
  "Hospital Services": {
    icon: Building2,
    iconClass: "bg-slate-100 text-slate-600 shadow-[inset_0_0_0_10px_rgba(248,250,252,0.95)]",
  },
  "Account & Profile": {
    icon: UserRound,
    iconClass: "bg-cyan-100 text-cyan-600 shadow-[inset_0_0_0_10px_rgba(236,254,255,0.9)]",
  },
  "Login & Security": {
    icon: LockKeyhole,
    iconClass: "bg-amber-100 text-amber-600 shadow-[inset_0_0_0_10px_rgba(255,251,235,0.9)]",
  },
  "AI Prediction": {
    icon: Sparkles,
    iconClass: "bg-fuchsia-100 text-fuchsia-600 shadow-[inset_0_0_0_10px_rgba(253,244,255,0.9)]",
  },
  "Technical Issue": {
    icon: Laptop,
    iconClass: "bg-red-100 text-red-500 shadow-[inset_0_0_0_10px_rgba(254,242,242,0.9)]",
  },
  "Feature Request": {
    icon: HeartPulse,
    iconClass: "bg-rose-100 text-rose-500 shadow-[inset_0_0_0_10px_rgba(255,241,242,0.9)]",
  },
  Other: {
    icon: CircleHelp,
    iconClass: "bg-slate-100 text-slate-600 shadow-[inset_0_0_0_10px_rgba(248,250,252,0.95)]",
  },
};

const formatTicketDate = (value) => {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const selectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition";

const getStatusMeta = (status) => statusMeta[status] || statusMeta.Open;
const getCategoryMeta = (category) => categoryMeta[category] || categoryMeta.Other;

export const MyTickets = () => {
  const { setHeaderContent } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setHeaderContent({
      title: "My Tickets",
      subtitle: "Track and manage all your support requests",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchAllTickets = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getMyTicketsAll();
        setTickets(response?.tickets || []);
      } catch (err) {
        setError(err.message || "Unable to load your tickets.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTickets();
  }, []);

  const ticketStats = useMemo(() => {
    const totalTickets = tickets.length;
    const countByStatus = (status) =>
      tickets.filter((ticket) => ticket.status === status).length;

    return [
      {
        label: "Total Tickets",
        value: totalTickets,
        note: "All time",
        icon: Ticket,
        cardClass: "border-red-100 bg-red-50/25",
        iconClass: "bg-red-100 text-red-500",
        noteClass: "text-blue-500",
      },
      {
        label: "Open",
        value: countByStatus("Open"),
        note: "Needs attention",
        icon: Clock3,
        cardClass: statusMeta.Open.softClass,
        iconClass: statusMeta.Open.statIconClass,
        noteClass: "text-orange-500",
      },
      {
        label: "In Progress",
        value: countByStatus("In Progress"),
        note: "Being worked on",
        icon: RefreshCw,
        cardClass: statusMeta["In Progress"].softClass,
        iconClass: statusMeta["In Progress"].statIconClass,
        noteClass: "text-blue-500",
      },
      {
        label: "Resolved",
        value: countByStatus("Resolved"),
        note: "Successfully resolved",
        icon: CheckCircle2,
        cardClass: statusMeta.Resolved.softClass,
        iconClass: statusMeta.Resolved.statIconClass,
        noteClass: "text-emerald-600",
      },
    ];
  }, [tickets]);

  const visibleTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tickets
      .filter((ticket) => {
        const matchesSearch =
          !normalizedSearch ||
          ticket.ticketId?.toLowerCase().includes(normalizedSearch) ||
          ticket.subject?.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
          statusFilter === "All" || ticket.status === statusFilter;
        const matchesCategory =
          categoryFilter === "All" || ticket.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((first, second) => {
        if (sortBy === "oldest") {
          return new Date(first.createdAt) - new Date(second.createdAt);
        }

        if (sortBy === "updated") {
          return new Date(second.updatedAt) - new Date(first.updatedAt);
        }

        return new Date(second.createdAt) - new Date(first.createdAt);
      });
  }, [categoryFilter, searchTerm, sortBy, statusFilter, tickets]);

  return (
    <div className="px-3 py-4 sm:px-5 lg:px-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ticketStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className={`flex min-h-24 items-center gap-4 rounded-lg border px-5 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)] ${stat.cardClass}`}
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${stat.iconClass}`}>
                <Icon className="size-5" strokeWidth={2.3} />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700">{stat.label}</p>
                <p className="mt-1 text-xl font-extrabold leading-none text-slate-950">
                  {stat.value}
                </p>
                <p className={`mt-2 text-xs font-bold leading-tight ${stat.noteClass}`}>
                  {stat.note}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-11 min-w-80 flex-1 cursor-text items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 transition">
            <span className="sr-only">Search tickets</span>
            <Search className="size-5 shrink-0 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by ticket ID or subject..."
              className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="relative block w-36 shrink-0 cursor-pointer">
            <span className="sr-only">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={selectClass}
            >
              <option value="All">Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          </label>

          <label className="relative block w-44 shrink-0 cursor-pointer">
            <span className="sr-only">Filter by category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className={selectClass}
            >
              <option value="All">Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          </label>

          <label className="relative block w-48 shrink-0 cursor-pointer">
            <span className="sr-only">Sort tickets</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={selectClass}
            >
              <option value="newest">Sort by: Newest</option>
              <option value="oldest">Sort by: Oldest</option>
              <option value="updated">Sort by: Recently Updated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          </label>
        </div>

        <div className="mt-4 space-y-2.5">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-500">
              <LoaderCircle className="mr-2 size-5 animate-spin text-red-500" />
              Loading tickets...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-600">
              {error}
            </div>
          ) : visibleTickets.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm font-extrabold text-slate-800">
                No tickets found
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            visibleTickets.map((ticket) => {
              const ticketStatusMeta = getStatusMeta(ticket.status);
              const ticketCategoryMeta = getCategoryMeta(ticket.category);
              const CategoryIcon = ticketCategoryMeta.icon;

              return (
                <article
                  key={ticket._id || ticket.ticketId}
                  className="flex min-h-[96px] items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.055)] transition hover:-translate-y-0.5 hover:border-red-100 hover:shadow-[0_16px_36px_rgba(15,23,42,0.085)]"
                >
                  <span className={`flex  size-12 shrink-0 items-center justify-center rounded-full ${ticketCategoryMeta.iconClass}`}>
                    <CategoryIcon className="size-6" strokeWidth={2.1} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-sm font-bold tracking-normal text-slate-950 sm:text-base">
                        {ticket.ticketId}
                      </h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ${ticketStatusMeta.badgeClass}`}>
                        <span className={`mr-2 size-1.5 rounded-full ${ticketStatusMeta.dotClass}`} />
                        {ticket.status}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm font-semibold leading-5 text-slate-800">
                      <span className="font-extrabold">{ticket.category}</span>
                      <span className="mx-2 text-slate-300">-</span>
                      {ticket.subject}
                    </p>

                    <div className="mt-1.5 flex flex-wrap gap-x-7 gap-y-2 text-xs font-semibold text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        Created: {formatTicketDate(ticket.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" />
                        Updated: {formatTicketDate(ticket.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <span className={`hidden min-w-24 items-center justify-center rounded-md px-3 py-2 text-xs font-extrabold sm:inline-flex ${ticketStatusMeta.badgeClass}`}>
                    <span className={`mr-2 size-1.5 rounded-full ${ticketStatusMeta.dotClass}`} />
                    {ticket.status}
                  </span>

                  <Link
                    to={`/my-tickets/${ticket.ticketId}`}
                    className="inline-flex cursor-pointer size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={`View ${ticket.ticketId}`}
                    
                  >
                    <ChevronRight className="size-5" />
                  </Link>
               </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
