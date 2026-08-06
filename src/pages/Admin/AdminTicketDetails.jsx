import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileImage,
  LoaderCircle,
  Mail,
  Phone,
  Tag,
  UserRound,
} from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import {
  getAdminTicketByTicketId,
  sendAdminTicketMessage,
  updateAdminTicketStatus,
} from "../../api/supportTicketApi";
import { TicketConversation } from "../../components/TicketConversation";
import { formatTicketDate } from "../../utils/dateCustomization";
import getInitials from "../../utils/getInitial";

const statusSteps = ["Open", "In Progress", "Resolved", "Closed"];

const getAllowedStatusOptions = (currentStatus) => {
  const currentIndex = statusSteps.indexOf(currentStatus);
  if (currentIndex === -1) return statusSteps;

  return statusSteps.slice(currentIndex);
};

const statusMeta = {
  Open: {
    activeIndex: 0,
    badgeClass: "bg-orange-100/85 text-orange-600",
    dotClass: "bg-orange-400",
  },
  "In Progress": {
    activeIndex: 1,
    badgeClass: "bg-blue-100/85 text-blue-600",
    dotClass: "bg-blue-500",
  },
  Resolved: {
    activeIndex: 2,
    badgeClass: "bg-emerald-100/85 text-emerald-600",
    dotClass: "bg-emerald-500",
  },
  Closed: {
    activeIndex: 3,
    badgeClass: "bg-slate-100 text-slate-600",
    dotClass: "bg-slate-500",
  },
};

const getStatusMeta = (status) => statusMeta[status] || statusMeta.Open;

const normalizeUser = (ticket) => {
  const user = ticket?.userId || {};

  return {
    name: user.username || ticket?.userName || "Unknown User",
    email: user.email || ticket?.email || "Not available",
    phone: user.phoneNumber || ticket?.phoneNumber || "Not available",
    role: user.role || "User",
    avatar: user.picture,
    joinedAt: user.createdAt,
  };
};

const normalizeTicket = (ticket) =>
  ticket
    ? {
        ...ticket,
        user: normalizeUser(ticket),
        messages: ticket.messages || [],
        statusHistory: ticket.statusHistory || [],
      }
    : null;

const getAttachmentName = (url) => {
  if (!url) return "screenshot";

  try {
    const pathname = new URL(url).pathname;
    const fileName = pathname.split("/").filter(Boolean).at(-1);
    return decodeURIComponent(fileName || "screenshot");
  } catch {
    return "screenshot";
  }
};

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ${meta.badgeClass}`}
    >
      <span className={`mr-2 size-1.5 rounded-full ${meta.dotClass}`} />
      {status || "Open"}
    </span>
  );
}

function DetailBox({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <h2 className="text-sm font-extrabold text-slate-950">{title}</h2>
      <div className="mt-2 text-sm font-medium leading-6 text-slate-700">
        {children}
      </div>
    </section>
  );
}

function UserPanel({ user }) {
  const initials = getInitials(user.name);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <h2 className="text-sm font-extrabold text-slate-950">User Details</h2>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-red-50 text-sm font-extrabold text-[#D90429]">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="size-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold text-slate-950">
            {user.name}
          </p>
          <p className="mt-1 truncate text-xs font-bold text-slate-500">
            {user.role}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
        <p className="flex min-w-0 items-center gap-2">
          <Mail className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">{user.email}</span>
        </p>
        <p className="flex min-w-0 items-center gap-2">
          <Phone className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">{user.phone}</span>
        </p>
        <p className="flex min-w-0 items-center gap-2">
          <UserRound className="size-4 shrink-0 text-slate-400" />
          <span className="truncate">Joined: {formatTicketDate(user.joinedAt)}</span>
        </p>
      </div>
    </section>
  );
}

function MiniTimeline({ ticket }) {
  const ticketStatusMeta = getStatusMeta(ticket.status);

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Progress
      </p>
      <div className="mt-3 grid grid-cols-4 gap-1">
        {statusSteps.map((step, index) => {
          const isComplete = index <= ticketStatusMeta.activeIndex;
          const isCurrent = index === ticketStatusMeta.activeIndex;

          return (
            <div key={step} className="min-w-0">
              <span
                className={`block h-1.5 rounded-full ${
                  isComplete ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
              <p
                className={`mt-2 truncate text-[11px] font-extrabold ${
                  isCurrent ? "text-slate-950" : "text-slate-500"
                }`}
                title={index === 0 ? "Submitted" : step}
              >
                {index === 0 ? "Submitted" : step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const AdminTicketDetailsPage = () => {
  const { setHeaderContent } = useOutletContext();
  const { ticketId } = useParams();
  const [ticketDetails, setTicketDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: undefined,
      subtitle: undefined,
      action: {
        to: "/admin/tickets",
        label: "Back to Support Tickets",
        icon: ArrowLeft,
      },
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAdminTicketByTicketId(ticketId);
        const ticketDetail = normalizeTicket(response?.ticketDetail);
        setTicketDetails(ticketDetail);
        setMessages(ticketDetail?.messages || []);
      } catch (err) {
        setError(err.message || "Unable to load ticket details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  const ticketStatusMeta = useMemo(
    () => getStatusMeta(ticketDetails?.status),
    [ticketDetails?.status],
  );

  const allowedStatusOptions = useMemo(
    () => getAllowedStatusOptions(ticketDetails?.status),
    [ticketDetails?.status],
  );

  const handleStatusChange = async (nextStatus) => {
    if (!ticketDetails || ticketDetails.status === nextStatus) return;

    if (!allowedStatusOptions.includes(nextStatus)) {
      setError("Ticket status can only move forward.");
      return;
    }

    const previousTicket = ticketDetails;
    const changedAt = new Date().toISOString();
    const optimisticTicket = {
      ...ticketDetails,
      status: nextStatus,
      updatedAt: changedAt,
      statusHistory: [...ticketDetails.statusHistory, { status: nextStatus, changedAt }],
    };

    try {
      setIsUpdatingStatus(true);
      setTicketDetails(optimisticTicket);
      const response = await updateAdminTicketStatus(ticketId, nextStatus);
      const updatedTicket = normalizeTicket(response?.ticket || optimisticTicket);
      setTicketDetails(updatedTicket);
      setMessages(updatedTicket?.messages || messages);
    } catch (err) {
      setTicketDetails(previousTicket);
      setError(err.message || "Unable to update ticket status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (message, image) => {
    const formData = new FormData();
    formData.append("message", message);
    if (image) formData.append("attachment", image);

    const response = await sendAdminTicketMessage(ticketId, formData);
    const updatedTicket = normalizeTicket(response?.ticket);

    if (updatedTicket) {
      setTicketDetails(updatedTicket);
      setMessages(updatedTicket.messages || []);
      return;
    }

    const ticketMessage = response?.ticketMessage;
    if (ticketMessage) {
      setMessages((currentMessages) => [...currentMessages, ticketMessage]);
      setTicketDetails((currentTicket) =>
        currentTicket
          ? {
              ...currentTicket,
              lastMessageBy: "Admin",
              lastRepliedAt: ticketMessage.createdAt,
              updatedAt: ticketMessage.updatedAt || ticketMessage.createdAt,
            }
          : currentTicket,
      );
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 py-4 sm:px-5 lg:px-6">
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-red-500" />
          Loading ticket details...
        </div>
      </div>
    );
  }

  if (error || !ticketDetails) {
    return (
      <div className="px-3 py-4 sm:px-5 lg:px-6">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-600">
          <AlertCircle className="mr-2 inline size-4" />
          {error || "Ticket details were not found."}
        </div>
      </div>
    );
  }

  const attachmentName =
    ticketDetails.screenshotName || getAttachmentName(ticketDetails.screenshot);

  return (
    <div className="px-3 py-4 font-[Poppins,var(--font-sans)] sm:px-5 lg:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-normal text-slate-950">
                  {ticketDetails.ticketId}
                </h1>
                <StatusBadge status={ticketDetails.status} />
              </div>

              <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">
                <span className="font-extrabold">{ticketDetails.category}</span>
                <span className="mx-2 text-slate-300">-</span>
                {ticketDetails.subject}
              </p>
            </div>

            <label className="relative block w-44 shrink-0">
              <span className="sr-only">Update ticket status</span>
              <select
                value={ticketDetails.status}
                disabled={isUpdatingStatus || ticketDetails.status === "Closed"}
                onChange={(event) => handleStatusChange(event.target.value)}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-extrabold text-slate-700 outline-none transition focus:border-[#D90429] focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {allowedStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Created: {formatTicketDate(ticketDetails.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5" />
              Updated: {formatTicketDate(ticketDetails.updatedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Last Message: {ticketDetails.lastMessageBy || "Not available"}
            </span>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <DetailBox title="Subject">
              <p>{ticketDetails.subject}</p>
            </DetailBox>

            <DetailBox title="Description">
              <p className="whitespace-pre-line">{ticketDetails.description}</p>
            </DetailBox>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
              <h2 className="text-sm font-extrabold text-slate-950">
                Attachments {ticketDetails.screenshot ? "(1)" : "(0)"}
              </h2>
              {ticketDetails.screenshot ? (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                      <FileImage className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-800">
                        {attachmentName}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        Uploaded screenshot
                      </p>
                    </div>
                  </div>
                  <a
                    href={ticketDetails.screenshot}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                    aria-label="Open attached screenshot"
                  >
                    <Eye className="size-4" />
                  </a>
                </div>
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-500">
                  No attachment was added to this ticket.
                </p>
              )}
            </section>

            <TicketConversation
              messages={messages}
              user={ticketDetails.user}
              isAdminView
              onSendMessage={handleSendMessage}
              emptyText="No conversation has started yet."
            />
          </div>

          <aside className="space-y-4">
            <UserPanel user={ticketDetails.user} />

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
              <h2 className="text-sm font-extrabold text-slate-950">Ticket Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <StatusBadge status={ticketDetails.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Category
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {ticketDetails.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Last Reply
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {formatTicketDate(ticketDetails.lastRepliedAt)}
                  </dd>
                </div>
              </dl>
              <MiniTimeline ticket={ticketDetails} />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
