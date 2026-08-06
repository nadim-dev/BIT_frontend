import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Ambulance,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Droplet,
  HeartPulse,
  Laptop,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageSquare,
  Pill,
  RefreshCw,
  Search,
  Sparkles,
  Ticket,
  UserRound,
} from "lucide-react";
import { getAllAdminTickets } from "../../api/supportTicketApi";
import getInitials from "../../utils/getInitial";

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
    badgeClass: "bg-orange-50 text-orange-700 ring-orange-200",
    dotClass: "bg-orange-500",
    statIconClass: "bg-orange-100 text-orange-600",
  },
  "In Progress": {
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
    dotClass: "bg-blue-500",
    statIconClass: "bg-blue-100 text-blue-600",
  },
  Resolved: {
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dotClass: "bg-emerald-500",
    statIconClass: "bg-emerald-100 text-emerald-600",
  },
  Closed: {
    badgeClass: "bg-slate-100 text-slate-700 ring-slate-200",
    dotClass: "bg-slate-500",
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

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Recently Updated", value: "updated" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const selectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-bold text-slate-700 outline-none transition focus:border-[#D90429] focus:ring-4 focus:ring-red-100";

const getStatusMeta = (status) => statusMeta[status] || statusMeta.Open;

const normalizeUser = (ticket) => {
  const user = ticket?.userId || {};

  return {
    name: user.username || ticket?.userName || "Unknown User",
    email: user.email || ticket?.email || "Not available",
    avatar: user.picture,
  };
};

const normalizeTicket = (ticket) => ({
  ...ticket,
  user: normalizeUser(ticket),
});

const formatRelativeTime = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(date.getTime())) return "Not available";
  if (diffMs < minute) return "Just now";
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diffMs < day * 2) return "Yesterday";

  const days = Math.floor(diffMs / day);
  return `${days} days ago`;
};

const formatTicketDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${meta.badgeClass}`}
    >
      <span className={`mr-2 size-1.5 rounded-full ${meta.dotClass}`} />
      {status || "Open"}
    </span>
  );
}

function ConversationBadge({ lastMessageBy }) {
  const isUserWaiting = lastMessageBy === "Admin";
  const label = isUserWaiting ? "Awaiting User" : "Needs Reply";
  const className = isUserWaiting
    ? "bg-blue-50/70 text-blue-700 ring-blue-100"
    : "bg-orange-50 text-orange-700 ring-orange-200";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${className}`}
    >
      <span
        className={`mr-2 size-2 rounded-full ${
          isUserWaiting ? "bg-blue-500" : "bg-orange-500"
        }`}
      />
      {label}
    </span>
  );
}

function TicketStats({ tickets }) {
  const stats = [
    {
      label: "Total Tickets",
      value: tickets.length,
      icon: Ticket,
      iconClass: "bg-red-50 text-[#D90429]",
    },
    {
      label: "Open Tickets",
      value: tickets.filter((ticket) => ticket.status === "Open").length,
      icon: Clock3,
      iconClass: statusMeta.Open.statIconClass,
    },
    {
      label: "In Progress",
      value: tickets.filter((ticket) => ticket.status === "In Progress").length,
      icon: RefreshCw,
      iconClass: statusMeta["In Progress"].statIconClass,
    },
    {
      label: "Resolved",
      value: tickets.filter((ticket) => ticket.status === "Resolved").length,
      icon: CheckCircle2,
      iconClass: statusMeta.Resolved.statIconClass,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.article
            key={stat.label}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.35, delay: index * 0.04 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.055)] transition-shadow hover:shadow-[0_16px_36px_rgba(15,23,42,0.085)]"
          >
            <div className="flex items-center gap-4">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}>
                <Icon className="size-5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-extrabold leading-none text-slate-950">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}

function TicketFilters({
  searchTerm,
  statusFilter,
  categoryFilter,
  sortBy,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: 0.12 }}
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.055)]"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex h-11 min-w-0 flex-1 cursor-text items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 transition focus-within:border-[#D90429] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
          <span className="sr-only">Search support tickets</span>
          <Search className="size-5 shrink-0 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by Ticket ID, user, category or subject..."
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
          <label className="relative block">
            <span className="sr-only">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value)}
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

          <label className="relative block">
            <span className="sr-only">Filter by category</span>
            <select
              value={categoryFilter}
              onChange={(event) => onCategoryChange(event.target.value)}
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

          <label className="relative block">
            <span className="sr-only">Sort tickets</span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              className={selectClass}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          </label>
        </div>
      </div>
    </motion.section>
  );
}

function AdminTicketCard({ ticket, index }) {
  const initials = getInitials(ticket.user.name);
  const ticketCategoryMeta = categoryMeta[ticket.category] || categoryMeta.Other;
  const CategoryIcon = ticketCategoryMeta.icon;
  const needsReply = ticket.lastMessageBy !== "Admin";

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`relative flex min-h-[108px] flex-col gap-3 overflow-hidden rounded-2xl border bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.085)] lg:flex-row lg:items-center lg:gap-4 lg:px-5 ${
        needsReply
          ? "border-slate-100 hover:border-orange-100"
          : "border-slate-100 hover:border-red-100"
      }`}
    >
      {needsReply ? (
        <span className="absolute inset-y-0 left-0 w-1 bg-orange-400" />
      ) : null}

      <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${ticketCategoryMeta.iconClass}`}>
        <CategoryIcon className="size-6" strokeWidth={2.1} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-base font-extrabold tracking-normal text-slate-950">
            {ticket.ticketId}
          </h3>
          <StatusBadge status={ticket.status} />
          <ConversationBadge lastMessageBy={ticket.lastMessageBy} />
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
          <span className="font-extrabold">{ticket.category}</span>
          <span className="mx-2 text-slate-300">-</span>
          {ticket.subject}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs font-semibold text-slate-500">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-50 text-[10px] font-extrabold text-[#D90429]">
              {initials}
            </span>
            <span className="truncate font-extrabold text-slate-700">
              {ticket.user.name}
            </span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{ticket.user.email}</span>
          </span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            Created: {formatTicketDate(ticket.createdAt)}
          </span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            Updated: {formatRelativeTime(ticket.updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
        <Link
          to={`/admin/tickets/${ticket.ticketId}`}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-600 transition hover:border-[#D90429] hover:text-[#D90429] focus:outline-none focus:ring-4 focus:ring-red-100"
          aria-label={`View ${ticket.ticketId}`}
        >
          View
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </motion.article>
  );
}

function EmptyTicketState() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_10px_28px_rgba(15,23,42,0.055)]"
    >
      <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-red-50 text-[#D90429]">
        <MessageSquare className="size-9" />
      </div>
      <h3 className="mt-6 text-lg font-extrabold text-slate-950">
        No support tickets
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
        Support tickets submitted by users will appear here.
      </p>
    </motion.section>
  );
}

export const AdminTicketsPage = () => {
  const { setHeaderContent } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Support Tickets",
      subtitle: "Review user tickets and continue support conversations.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoadingTickets(true);
        setError("");
        const response = await getAllAdminTickets();
        setTickets((response?.tickets || []).map(normalizeTicket));
      } catch (err) {
        setError(err.message || "Unable to load support tickets.");
      } finally {
        setIsLoadingTickets(false);
      }
    };

    fetchTickets();
  }, []);

  const visibleTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tickets
      .filter((ticket) => {
        const matchesSearch =
          !normalizedSearch ||
          [
            ticket.ticketId,
            ticket.user.name,
            ticket.user.email,
            ticket.category,
            ticket.subject,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch));
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
    <section className="min-h-[calc(100vh-120px)] bg-[#F8FAFC] px-3 py-4 font-[Poppins,var(--font-sans)] sm:px-5 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <TicketStats tickets={tickets} />

        <TicketFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
          onSortChange={setSortBy}
        />

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertCircle className="mr-2 inline size-4" />
            {error}
          </div>
        ) : null}

        {isLoadingTickets ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm font-bold text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.055)]">
            <LoaderCircle className="mr-2 inline size-5 animate-spin text-[#D90429]" />
            Loading support tickets...
          </div>
        ) : visibleTickets.length ? (
          <div className="space-y-3">
            {visibleTickets.map((ticket, index) => (
              <AdminTicketCard
                key={ticket._id || ticket.ticketId}
                ticket={ticket}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyTicketState />
        )}
      </div>
    </section>
  );
};
