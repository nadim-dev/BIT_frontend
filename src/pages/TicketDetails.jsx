import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, Clock3, Eye, FileImage, LoaderCircle, Tag, X } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { getTicketByTicketId, sendTicketMessage } from "../api/supportTicketApi";
import { formatTicketDate } from "../utils/dateCustomization";
import { useAuth } from "../hooks/useAuth";
import { TicketConversation } from "../components/TicketConversation";

const statusSteps = ["Open", "In Progress", "Resolved", "Closed"];

const statusMeta = {
  Open: {
    label: "Open",
    activeIndex: 0,
    badgeClass: "bg-orange-100/85 text-orange-600",
    dotClass: "bg-orange-400",
  },
  "In Progress": {
    label: "In Progress",
    activeIndex: 1,
    badgeClass: "bg-blue-100/85 text-blue-600",
    dotClass: "bg-blue-500",
  },
  Resolved: {
    label: "Resolved",
    activeIndex: 2,
    badgeClass: "bg-emerald-100/85 text-emerald-600",
    dotClass: "bg-emerald-500",
  },
  Closed: {
    label: "Closed",
    activeIndex: 3,
    badgeClass: "bg-slate-100 text-slate-600",
    dotClass: "bg-slate-500",
  },
};

const getStatusMeta = (status) => statusMeta[status] || statusMeta.Open;

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

function Timeline({ ticket }) {
  const ticketStatusMeta = getStatusMeta(ticket.status);
  const activeColorClass =
    ticketStatusMeta.label === "Open" ? "bg-emerald-500" : ticketStatusMeta.dotClass;
  const connectorColorClass =
    ticketStatusMeta.label === "Open" ? "bg-orange-200" : "bg-emerald-300";
  const progressWidth = `${(ticketStatusMeta.activeIndex / (statusSteps.length - 1)) * 100}%`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <h2 className="text-sm font-extrabold text-slate-950">Status Timeline</h2>
      <div className="relative mt-6 px-2 sm:px-8">
        <div className="absolute left-[12.5%] right-[12.5%] top-3 h-px bg-slate-200">
          <span
            className={`block h-full ${connectorColorClass}`}
            style={{ width: progressWidth }}
          />
        </div>
        <div className="relative grid grid-cols-4 gap-2">
        {statusSteps.map((step, index) => {
          const isComplete = index <= ticketStatusMeta.activeIndex;
          const isCurrent = index === ticketStatusMeta.activeIndex;
          const stepDate = index === 0 ? ticket.createdAt : isComplete ? ticket.updatedAt : null;
          const label = index === 0 ? "Submitted" : step;

          return (
            <div key={step} className="relative flex flex-col items-center text-center">
              <span
                className={`relative z-10 flex size-6 items-center justify-center rounded-full ${
                  isComplete ? `${isCurrent ? activeColorClass : "bg-emerald-500"} text-white` : "bg-slate-200 text-white"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <span className="size-2 rounded-full bg-slate-400" />
                )}
              </span>
              <p className={`mt-2 text-xs font-extrabold ${isCurrent ? "text-slate-950" : "text-slate-600"}`}>
                {label}
              </p>
              <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-400">
                {formatTicketDate(stepDate)}
              </p>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

export const TicketDetails = () => {
  const [ticketDetails, setTicketDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { setHeaderContent } = useOutletContext();
  const { currentUser } = useAuth();
  const { ticketId } = useParams();



  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setIsLoading(true);
        setError("");
        const ticketData = await getTicketByTicketId(ticketId);
        const ticketDetail = ticketData?.ticketDetail || null;
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

  useEffect(() => {
    setHeaderContent({
      title: undefined,
      subtitle: undefined,
      action: {
        to: "/my-tickets",
        label: "Back to My Tickets",
        icon: ArrowLeft,
      },
    });
  }, [setHeaderContent]);

  const ticketStatusMeta = useMemo(
    () => getStatusMeta(ticketDetails?.status),
    [ticketDetails?.status],
  );

  const handleSendMessage = async (message, image) => {
    const formData = new FormData();
    formData.append("message", message);

    if (image) {
      formData.append("attachment", image);
    }

    const response = await sendTicketMessage(ticketId, formData);
    const ticketMessage = response?.ticketMessage;
    
    if (ticketMessage) {
      setMessages((currentMessages) => [...currentMessages, ticketMessage]);
      setTicketDetails((currentTicket) =>
        currentTicket
          ? {
              ...currentTicket,
              lastMessageBy: "user",
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
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-normal text-slate-950">
                  {ticketDetails.ticketId}
                </h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ${ticketStatusMeta.badgeClass}`}>
                  <span className={`mr-2 size-1.5 rounded-full ${ticketStatusMeta.dotClass}`} />
                  {ticketStatusMeta.label}
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold leading-5 text-slate-800">
                <span className="font-extrabold">{ticketDetails.category}</span>
                <span className="mx-2 text-slate-300">-</span>
                {ticketDetails.subject}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex min-h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 text-xs font-extrabold text-red-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <X className="size-3.5" />
              Close Ticket
            </button>
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
              Priority: {ticketDetails.priority || "Medium"}
            </span>
          </div>
        </section>

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

        <Timeline ticket={ticketDetails} />

        <TicketConversation
          messages={messages}
          user={currentUser}
          onSendMessage={handleSendMessage}
          emptyText="No messages yet."
        />

        {ticketDetails.resolvedAt ? (
          <section className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            Resolved on {formatTicketDate(ticketDetails.resolvedAt)}
          </section>
        ) : null}

      </div>
    </div>
  );
};
