import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  Phone,
  Search,
  Send,
  User,
} from "lucide-react";
import { getAllEnquiries, replyToEnquiry } from "../../api/enquiryApi";

const statusBadgeClass = {
  Pending: "bg-orange-50 text-orange-700 ring-orange-200",
  Replied: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const formatReceived = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (firstDate, secondDate) =>
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
};

const formatReceivedDate = (value) => {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const normalizeEnquiry = (enquiry) => ({
  id: enquiry._id,
  name: enquiry.name,
  email: enquiry.email,
  phone: enquiry.phone || "Not provided",
  subject: enquiry.subject,
  message: enquiry.message,
  received: formatReceived(enquiry.createdAt),
  receivedDate: formatReceivedDate(enquiry.createdAt),
  status: enquiry.isReplied ? "Replied" : "Pending",
  createdAt: enquiry.createdAt,
});

const isToday = (value) => {
  if (!value) return false;

  const date = new Date(value);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const StatCard = ({ stat, index }) => {
  const Icon = stat.icon;

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{stat.title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
            {stat.value}
          </h3>
          <p className="mt-1.5 text-xs font-medium text-slate-500">
            {stat.subtitle}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#D90429]">
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>
    </motion.article>
  );
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
      statusBadgeClass[status] || statusBadgeClass.Pending
    }`}
  >
    {status}
  </span>
);

const ViewButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
  >
    <Eye size={17} />
    View
  </motion.button>
);

const EnquiryTable = ({ enquiries, onView }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.35, delay: 0.18 }}
    className="hidden overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_22px_55px_rgba(15,23,42,0.06)] md:block"
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead className="border-b border-[#E5E7EB] bg-slate-50/80">
          <tr>
            {["Name", "Email", "Subject", "Received", "Replied", "Action"].map(
              (heading) => (
                <th
                  key={heading}
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {enquiries.map((enquiry) => (
            <tr key={enquiry.id} className="transition hover:bg-slate-50/70">
              <td className="px-6 py-5 text-sm font-semibold text-slate-950">
                {enquiry.name}
              </td>
              <td className="px-6 py-5 text-sm text-slate-600">
                {enquiry.email}
              </td>
              <td className="px-6 py-5 text-sm font-medium text-slate-800">
                {enquiry.subject}
              </td>
              <td className="px-6 py-5 text-sm text-slate-500">
                {enquiry.received}
              </td>
              <td className="px-6 py-5">
                <StatusBadge status={enquiry.status} />
              </td>
              <td className="px-6 py-5">
                <ViewButton onClick={() => onView(enquiry)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const EnquiryCards = ({ enquiries, onView }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.35, delay: 0.18 }}
    className="space-y-3 md:hidden"
  >
    {enquiries.map((enquiry) => (
      <article
        key={enquiry.id}
        className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-950">
              {enquiry.name}
            </h3>
            <p className="mt-1 truncate text-sm text-slate-500">
              {enquiry.email}
            </p>
          </div>
          <StatusBadge status={enquiry.status} />
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {enquiry.subject}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {enquiry.received}
            </p>
          </div>
          <ViewButton onClick={() => onView(enquiry)} />
        </div>
      </article>
    ))}
  </motion.div>
);

const EmptyState = () => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    animate="visible"
    className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-6 py-16 text-center shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
  >
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#D90429]">
      <Mail size={30} />
    </div>
    <h3 className="mt-5 text-lg font-bold text-slate-950">No enquiries yet</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      Messages submitted from your landing page will appear here.
    </p>
  </motion.div>
);

const EnquiryDrawer = ({ enquiry, onClose, onSendReply }) => {
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setReply("");
  }, [enquiry?.id]);

  return (
    <AnimatePresence>
      {enquiry ? (
        <>
          <motion.button
            type="button"
            aria-label="Close enquiry drawer"
            className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[#E5E7EB] bg-white shadow-[-24px_0_60px_rgba(15,23,42,0.14)] sm:max-w-[420px]"
          >
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#D90429]">
                  <User size={25} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-slate-950">
                    {enquiry.name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {enquiry.email}
                  </p>
                </div>
              </div>

              <dl className="mt-8 space-y-5">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Phone Number
                  </dt>
                  <dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Phone size={16} className="text-[#D90429]" />
                    {enquiry.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Subject
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-900">
                    {enquiry.subject}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Message
                  </dt>
                  <dd className="mt-2 rounded-2xl border border-[#E5E7EB] bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
                    {enquiry.message}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Received Date
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-slate-800">
                    {enquiry.receivedDate}
                  </dd>
                </div>
              </dl>

              <div className="my-7 h-px bg-[#E5E7EB]" />

              <label
                htmlFor="admin-reply"
                className="text-sm font-bold text-slate-950"
              >
                Reply
              </label>
              <textarea
                id="admin-reply"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Write your reply..."
                className="mt-3 min-h-40 w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#D90429] focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div className="border-t border-[#E5E7EB] bg-white p-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isSending || !reply.trim()}
                onClick={async () => {
                  setIsSending(true);
                  const wasSent = await onSendReply(enquiry.id, reply);
                  if (!wasSent) {
                    setIsSending(false);
                  }
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#D90429] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(217,4,41,0.24)] transition hover:bg-[#b80322] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={18} />
                {isSending ? "Sending..." : "Send Reply"}
              </motion.button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export const AdminEnquiryPage = () => {
  const { setHeaderContent } = useOutletContext();
  const [enquiries, setEnquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Enquiries",
      subtitle: "Manage customer enquiries and respond quickly.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAllEnquiries();
        setEnquiries((response?.enquiries || []).map(normalizeEnquiry));
      } catch (err) {
        setError(err.message || "Unable to load enquiries.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  const enquiryStats = useMemo(() => {
    const pendingCount = enquiries.filter(
      (enquiry) => enquiry.status === "Pending"
    ).length;
    const repliedCount = enquiries.filter(
      (enquiry) => enquiry.status === "Replied"
    ).length;
    const todayCount = enquiries.filter((enquiry) =>
      isToday(enquiry.createdAt)
    ).length;

    return [
      {
        title: "Total Enquiries",
        value: enquiries.length,
        subtitle: "Current records",
        icon: Mail,
      },
      {
        title: "Pending Reply",
        value: pendingCount,
        subtitle: "Need response",
        icon: Clock3,
      },
      {
        title: "Replied",
        value: repliedCount,
        subtitle: "Marked replied",
        icon: CheckCircle2,
      },
      {
        title: "Today's Enquiries",
        value: todayCount,
        subtitle: "Received today",
        icon: Calendar,
      },
    ];
  }, [enquiries]);

  const filteredEnquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return enquiries;

    return enquiries.filter((enquiry) =>
      [enquiry.name, enquiry.email, enquiry.subject].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [enquiries, searchTerm]);

  const handleSendReply = async (id, reply) => {
    try {
      setError("");
      const response = await replyToEnquiry(id, { reply });
      const updatedEnquiry = normalizeEnquiry(response?.enquiry);

      setEnquiries((currentEnquiries) =>
        currentEnquiries.map((enquiry) =>
          enquiry.id === id ? updatedEnquiry : enquiry
        )
      );
      setSelectedEnquiry(null);
      return true;
    } catch (err) {
      setError(err.message || "Unable to send reply.");
      return false;
    }
  };

  return (
    <section className="min-h-[calc(100vh-120px)] bg-[#F8FAFC] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {enquiryStats.map((stat, index) => (
            <StatCard key={stat.title} stat={stat} index={index} />
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35, delay: 0.12 }}
          className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
        >
          <div className="relative">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email or subject..."
              className="h-12 w-full rounded-xl border border-transparent bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D90429] focus:bg-white focus:ring-4 focus:ring-red-100"
            />
          </div>
        </motion.div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center text-sm font-semibold text-slate-500 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
          >
            Loading enquiries...
          </motion.div>
        ) : filteredEnquiries.length > 0 ? (
          <>
            <EnquiryTable
              enquiries={filteredEnquiries}
              onView={setSelectedEnquiry}
            />
            <EnquiryCards
              enquiries={filteredEnquiries}
              onView={setSelectedEnquiry}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      <EnquiryDrawer
        enquiry={selectedEnquiry}
        onClose={() => setSelectedEnquiry(null)}
        onSendReply={handleSendReply}
      />
    </section>
  );
};
