import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarDays, ClipboardList, Clock3, Copy, Droplet, LoaderCircle, MapPin, MoreVertical, PackageCheck, Truck, XCircle } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { cancelMyBloodRequest, getMyBloodRequests } from "../api/bloodBankApi.js";
import { formatTicketDate } from "../utils/dateCustomization.js";

const statusTone = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-100",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  ReadyToDispatch: "bg-blue-50 text-blue-700 ring-blue-100",
  Rejected: "bg-red-50 text-red-700 ring-red-100",
  Cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const getBankAddress = (bank = {}) => {
  const address = bank.address || {};
  return [address.city, address.district, address.state].filter(Boolean).join(", ") || address.completeAddress || "Address not available";
};

const getPrimaryItem = (request) => request.items?.[0] || {};

const getTotalUnits = (items = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0), 0);

const getStatusText = (request) => {
  if (request.deliveryStatus === "ReadyToDispatch") return "Ready to dispatch";
  if (request.requestStatus === "Pending") return "Waiting for blood bank confirmation";
  if (request.requestStatus === "Approved" && request.deliveryStatus === "NotAssigned") return "Accepted by blood bank";
  if (request.deliveryStatus === "OutForDelivery") return "Out for delivery";
  if (request.deliveryStatus === "Delivered" || request.requestStatus === "Completed") return "Delivered";
  if (request.requestStatus === "Rejected") return "Request rejected";
  return request.requestStatus || "Pending";
};

const getDisplayStatus = (request) =>
  request.deliveryStatus === "ReadyToDispatch" ? "Ready to dispatch" : request.requestStatus || "Pending";

const getStatusTone = (request) =>
  request.deliveryStatus === "ReadyToDispatch"
    ? statusTone.ReadyToDispatch
    : statusTone[request.requestStatus] || statusTone.Pending;

const getCompletedSteps = (request) => {
  const completed = new Set(["requested"]);

  if (["Approved", "Completed"].includes(request.requestStatus)) completed.add("accepted");
  if (["ReadyToDispatch", "Assigned", "PickedUp", "OutForDelivery", "Delivered"].includes(request.deliveryStatus)) completed.add("accepted");
  if (["OutForDelivery", "Delivered"].includes(request.deliveryStatus)) completed.add("delivery");
  if (request.deliveryStatus === "Delivered" || request.requestStatus === "Completed") completed.add("delivered");

  return completed;
};

const getProgressPercent = (request) => {
  const completedSteps = getCompletedSteps(request);
  const completedCount = completedSteps.size;

  if (request.requestStatus === "Rejected" || request.requestStatus === "Cancelled") return 100;
  return Math.min(100, Math.max(25, completedCount * 25));
};

function RequestSummaryPill({ icon: Icon, tone, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <span className={`grid size-8 shrink-0 place-items-center rounded-full ${tone}`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase leading-3 text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-black leading-5 text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function RequestCard({ request, isCancelling, onCancel }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const bank = request.bloodBankId || {};
  const primaryItem = getPrimaryItem(request);
  const totalUnits = getTotalUnits(request.items);
  const canCancel = request.requestStatus === "Pending";

  const handleCancelClick = () => {
    setIsMenuOpen(false);
    onCancel(request._id);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_44px_rgba(15,23,42,0.1)]">
      <div className="p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <Droplet className="size-5 fill-red-500" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black leading-6 text-slate-950">Blood Request</h2>
              <p className="mt-1 font-mono text-sm font-black text-slate-500">
                {request.requestNumber || "Request number unavailable"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:justify-self-end">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black ${getStatusTone(request)}`}>
              <Clock3 className="size-3.5" />
              {getDisplayStatus(request)}
            </span>
            {canCancel ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Open request actions"
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((current) => !current)}
                  className="grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <MoreVertical className="size-4" />
                </button>
                {isMenuOpen ? (
                  <div className="absolute right-0 top-9 z-10 w-40 rounded-lg border border-slate-200 bg-white p-1.5 text-left shadow-[0_14px_30px_rgba(15,23,42,0.14)]">
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={handleCancelClick}
                      className="flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-[11px] font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCancelling ? <LoaderCircle className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
                      Cancel Request
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              <Building2 className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-slate-400">Requested from</p>
              <p className="truncate text-sm font-black text-slate-950">{bank.bloodBankName || "Blood bank unavailable"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 sm:justify-self-end">
            <CalendarDays className="size-4 text-blue-600" />
            {formatTicketDate(request.createdAt, "Not available")}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <RequestSummaryPill icon={Droplet} tone="bg-red-100 text-red-600" label="Group" value={primaryItem.bloodGroup || "Mixed"} />
          <RequestSummaryPill icon={PackageCheck} tone="bg-rose-100 text-rose-700" label="Component" value={primaryItem.component || "Multiple"} />
          <RequestSummaryPill icon={ClipboardList} tone="bg-sky-100 text-sky-700" label="Units" value={`${totalUnits} Unit${totalUnits === 1 ? "" : "s"}`} />
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-slate-500">{getStatusText(request)}</p>
          <Link to={`/my-requests/${request._id}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-black text-white shadow-[0_10px_22px_rgba(220,38,38,0.2)] transition hover:bg-red-700">
            <Truck className="size-4" />
            Track Request
          </Link>
        </div>
      </div>
    </article>
  );
}

export const UsersAllRequest = () => {
  const { setHeaderContent } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingRequestId, setCancellingRequestId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "My Requests",
      subtitle: "Track your blood requests and delivery progress.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getMyBloodRequests();
        setRequests(response?.bloodRequests || []);
      } catch (err) {
        setError(err.message || "Unable to load blood requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const sortedRequests = useMemo(
    () => [...requests].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)),
    [requests],
  );

  const handleCancelRequest = async (requestId) => {
    try {
      setCancellingRequestId(requestId);
      setError("");
      const response = await cancelMyBloodRequest(requestId);
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId ? response?.bloodRequest || { ...request, requestStatus: "Cancelled" } : request,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to cancel blood request.");
    } finally {
      setCancellingRequestId("");
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 py-4 sm:px-5 lg:px-6">
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-[#D90429]" />
          Loading blood requests...
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-120px)] bg-[#F8FAFC] px-3 py-3 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-5xl space-y-3">
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        {sortedRequests.length ? (
          sortedRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              isCancelling={cancellingRequestId === request._id}
              onCancel={handleCancelRequest}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <Droplet className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-base font-black text-slate-950">No blood requests yet</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Requests you submit from approved blood banks will appear here.</p>
            <Link to="/nearby-blood-banks" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#D90429] px-4 text-xs font-black text-white">
              Find Blood Banks
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
