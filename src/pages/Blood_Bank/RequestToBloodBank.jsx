import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ClipboardList,
  Droplet,
  LoaderCircle,
  MessageSquareText,
  PackageCheck,
  Phone,
  Truck,
  X,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  approveIncomingBloodBankRequest,
  getIncomingBloodBankRequests,
  markIncomingBloodBankRequestReadyToDispatch,
  rejectIncomingBloodBankRequest,
  generatePickupOtp,
} from "../../api/bloodBankApi";
import { formatTicketDate } from "../../utils/dateCustomization";
import getInitials from "../../utils/getInitial";

const statusClass = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ReadyToDispatch: "border-blue-200 bg-blue-50 text-blue-700",
  Rejected: "border-red-200 bg-red-50 text-red-700",
  Cancelled: "border-slate-200 bg-slate-100 text-slate-600",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const getDisplayStatus = (request = {}) =>
  request.deliveryStatus === "ReadyToDispatch" ? "Ready to dispatch" : request.requestStatus || "Pending";

const getStatusTone = (request = {}) =>
  request.deliveryStatus === "ReadyToDispatch"
    ? statusClass.ReadyToDispatch
    : statusClass[request.requestStatus] || statusClass.Pending;

const getDeliveryStatusLabel = (status) =>
  status === "OnTheWayToPickup" ? "On the Way" : status || "Assigned";

const getTotalUnits = (items = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0), 0);

const getRequesterName = (request = {}) =>
  request.patient?.name || request.userId?.username || "Requester unavailable";

const getRequesterPhone = (request = {}) =>
  request.patient?.contactNumber || request.userId?.phoneNumber || "Phone unavailable";

function UserAvatar({ name, imageUrl }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (imageUrl?.trim() && !hasImageError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onError={() => setHasImageError(true)}
        className="size-11 shrink-0 rounded-full object-cover ring-2 ring-white shadow-[0_6px_14px_rgba(15,23,42,0.12)]"
      />
    );
  }

  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-slate-900 text-sm font-black leading-none text-white ring-2 ring-white shadow-[0_6px_14px_rgba(37,99,235,0.24)]">
      {getInitials(name || "User")}
    </span>
  );
}

function BloodRequestCard({ request, isUpdating, onApprove, onReject, onReadyToDispatch }) {
  const [pickupOtp, setPickupOtp] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const items = request.items || [];
  const primaryItem = items[0] || {};
  const requestedBy = getRequesterName(request);
  const requesterImage = request.userId?.picture || request.userId?.imageUrl || request.userId?.imageURL || "";
  const totalUnits = getTotalUnits(items);
  const deliveryPartnerName = request.deliveryPartnerName || request.deliveryPartnerId?.fullName;
  const canAct = request.requestStatus === "Pending";
  const canMarkReadyToDispatch =
    request.requestStatus === "Approved" && request.deliveryStatus === "NotAssigned";

  const handleGeneratePickupOtp = async () => {
    try {
      setIsGeneratingOtp(true);
      const response = await generatePickupOtp(request._id);
      setPickupOtp(response?.otp || "");
    } catch (error) {
      setPickupOtp(error.message || "Unable to generate OTP.");
    } finally {
      setIsGeneratingOtp(false);
    }
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
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black leading-6 text-slate-950">Blood Request</h2>
              </div>
              <p className="mt-1 font-mono text-sm font-black text-slate-500">
                {request.requestNumber || "Request number unavailable"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:justify-self-end">
            <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${getStatusTone(request)}`}>
              {getDisplayStatus(request)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3">
            <UserAvatar name={requestedBy} imageUrl={requesterImage} />
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase text-slate-400">Requested by</p>
              <p className="truncate text-sm font-black text-slate-950">{requestedBy}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Phone className="size-3.5" />
                {getRequesterPhone(request)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-100 sm:justify-self-end">
            <CalendarDays className="size-4 text-blue-600" />
            {formatTicketDate(request.createdAt, "Not available")}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-black uppercase text-slate-400">Group</p>
            <p className="mt-0.5 text-sm font-black text-slate-950">{primaryItem.bloodGroup || "Mixed"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-black uppercase text-slate-400">Component</p>
            <p className="mt-0.5 text-sm font-black text-slate-950">{primaryItem.component || "Multiple"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p className="text-[10px] font-black uppercase text-slate-400">Units</p>
            <p className="mt-0.5 text-sm font-black text-slate-950">
              {totalUnits} Unit{totalUnits === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {canAct ? (
          <div className="mt-4 grid gap-2 sm:ml-auto sm:w-fit sm:grid-cols-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onReject(request._id)}
              className="cursor-pointer inline-flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isUpdating ? <LoaderCircle className="size-4 animate-spin" /> : <X className="size-4" />}
              Reject
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onApprove(request._id)}
              className="cursor-pointer inline-flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-black text-white shadow-[0_10px_22px_rgba(5,150,105,0.24)] transition hover:bg-emerald-700 hover:shadow-[0_12px_26px_rgba(5,150,105,0.3)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isUpdating ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Approve
            </button>
          </div>
        ) : null}

        {canMarkReadyToDispatch ? (
          <div className="mt-4 flex sm:justify-end">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onReadyToDispatch(request._id)}
              className="cursor-pointer inline-flex h-9 min-w-40 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 hover:shadow-[0_12px_26px_rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isUpdating ? <LoaderCircle className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
              Ready to dispatch
            </button>
          </div>
        ) : null}

        {deliveryPartnerName ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-600">
              <Truck className="size-4 text-blue-600" />
              Delivery
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1 text-sm font-bold text-slate-700">
                <p>Delivery Partner: <span className="font-black text-slate-950">{deliveryPartnerName}</span></p>
                <p>Status: <span className="font-black text-slate-950">{getDeliveryStatusLabel(request.deliveryStatus)}</span></p>
                {request.deliveryStatus === "OnTheWayToPickup" ? (
                  <button type="button" onClick={handleGeneratePickupOtp} disabled={isGeneratingOtp} className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50">
                    {isGeneratingOtp ? "Generating..." : "Generate Pickup OTP"}
                  </button>
                ) : null}
                {request.deliveryStatus === "OnTheWayToPickup" && pickupOtp ? (
                  <p className="pt-1 text-lg font-black tracking-[0.25em] text-blue-700">OTP: {pickupOtp}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 text-xs font-black text-blue-700 transition hover:bg-blue-50"
              >
                View Delivery
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CompletedBloodRequestCard({ request }) {
  const item = request.items?.[0] || {};
  const addressText = (address = {}) => [address.completeAddress, address.city, address.state, address.pincode].filter(Boolean).join(", ") || "Address unavailable";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"><CheckCircle2 className="size-5" /></span><div><p className="text-sm font-black text-slate-950">Completed</p><p className="mt-1 font-mono text-xs font-black text-slate-500">{request.requestNumber || "Request number unavailable"}</p></div></div>
        <p className="text-xs font-bold text-slate-500">{formatTicketDate(request.updatedAt || request.createdAt, "Date unavailable")}</p>
      </div>
      <p className="mt-4 text-sm font-black text-slate-800">Delivered by {request.deliveryPartnerId?.fullName || "delivery partner unavailable"} <span className="mx-2 text-slate-300">•</span> {item.bloodGroup || "Mixed"} {item.component || "Blood"}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">Quantity: {item.quantity || 0} Unit{Number(item.quantity) === 1 ? "" : "s"}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"><div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"><p className="text-[10px] font-black uppercase text-red-600">Pickup</p><p className="mt-1 text-xs font-black text-slate-800">{request.bloodBankId?.bloodBankName || "Blood bank"}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{addressText(request.bloodBankId?.address)}</p></div><span className="hidden text-xl text-slate-400 sm:block">→</span><div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"><p className="text-[10px] font-black uppercase text-emerald-600">Delivery</p><p className="mt-1 text-xs font-black text-slate-800">{request.patient?.name || "Recipient"}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{addressText(request.deliveryAddress)}</p></div></div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs font-black text-slate-600"><span>Collection: Rs. {request.payment?.amount ?? "-"}</span><span>{request.payment?.collectionMethod || "Payment unavailable"}</span></div>
    </article>
  );
}

export const RequestToBloodBank = () => {
  const { setHeaderContent, deliveryPartnerSocket } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingRequestId, setUpdatingRequestId] = useState("");
  const [error, setError] = useState("");
  const [rejectionRequest, setRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    setHeaderContent({
      title: "Blood Requests",
      subtitle: "Review, manage, and respond to incoming blood requests",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getIncomingBloodBankRequests();
        setRequests(response?.bloodRequests || []);
      } catch (err) {
        setError(err.message || "Unable to load incoming blood requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    if (!deliveryPartnerSocket) return;

    const handleDeliveryPartnerAssigned = (assignment) => {
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          String(request._id) === String(assignment.bloodRequestId)
            ? {
                ...request,
                deliveryPartnerId: assignment.deliveryPartnerId,
                deliveryRequestId: assignment.deliveryRequestId,
                deliveryPartnerName: assignment.deliveryPartnerName,
                deliveryStatus: assignment.deliveryStatus || "Assigned",
              }
            : request,
        ),
      );
    };

    const handleDeliveryStatusUpdated = (statusUpdate) => {
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          String(request._id) === String(statusUpdate.bloodRequestId)
            ? {
                ...request,
                deliveryStatus: statusUpdate.deliveryStatus,
                requestStatus: statusUpdate.requestStatus || request.requestStatus,
              }
            : request,
        ),
      );
    };

    deliveryPartnerSocket.on("deliveryPartnerAssigned", handleDeliveryPartnerAssigned);
    deliveryPartnerSocket.on("deliveryStatusUpdated", handleDeliveryStatusUpdated);

    return () => {
      deliveryPartnerSocket.off("deliveryPartnerAssigned", handleDeliveryPartnerAssigned);
      deliveryPartnerSocket.off("deliveryStatusUpdated", handleDeliveryStatusUpdated);
    };
  }, [deliveryPartnerSocket]);

  const sortedRequests = useMemo(
    () => [...requests].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)),
    [requests],
  );

  const completedRequests = sortedRequests.filter((request) => request.requestStatus === "Completed" || request.deliveryStatus === "Delivered");
  const activeRequests = sortedRequests.filter((request) => !completedRequests.some((completed) => completed._id === request._id));
  const visibleRequests = activeTab === "active" ? activeRequests : completedRequests;

  const handleReject = (requestId) => {
    setRejectionRequest(requests.find((request) => request._id === requestId) || null);
    setRejectionReason("");
  };

  const handleApprove = async (requestId) => {
    try {
      setUpdatingRequestId(requestId);
      setError("");
      const response = await approveIncomingBloodBankRequest(requestId);
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId ? response?.bloodRequest || { ...request, requestStatus: "Approved" } : request,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to approve blood request.");
    } finally {
      setUpdatingRequestId("");
    }
  };

  const handleReadyToDispatch = async (requestId) => {
    try {
      setUpdatingRequestId(requestId);
      setError("");
      const response = await markIncomingBloodBankRequestReadyToDispatch(requestId);
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === requestId
            ? response?.bloodRequest || { ...request, deliveryStatus: "ReadyToDispatch" }
            : request,
        ),
      );
    } catch (err) {
      setError(err.message || "Unable to mark blood request ready to dispatch.");
    } finally {
      setUpdatingRequestId("");
    }
  };

  const confirmRejection = async () => {
    const reason = rejectionReason.trim();
    if (!rejectionRequest || !reason) return;

    try {
      setUpdatingRequestId(rejectionRequest._id);
      setError("");
      const response = await rejectIncomingBloodBankRequest(
        rejectionRequest._id,
        reason,
      );
      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request._id === rejectionRequest._id
            ? response?.bloodRequest || { ...request, requestStatus: "Rejected", rejectionReason: reason }
            : request,
        ),
      );
      setRejectionRequest(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.message || "Unable to reject blood request.");
    } finally {
      setUpdatingRequestId("");
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 py-4 sm:px-5 lg:px-6">
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-[#D90429]" />
          Loading incoming blood requests...
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="min-h-[calc(100vh-120px)] bg-[#F8FAFC] px-3 py-3 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-6xl space-y-3">
        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertCircle className="size-4" />
            {error}
          </div>
        ) : null}

        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button type="button" onClick={() => setActiveTab("active")} className={`min-w-36 rounded-md cursor-pointer px-5 py-2 text-xs font-black transition ${activeTab === "active" ? "bg-red-50 text-red-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>Active ({activeRequests.length})</button>
          <button type="button"  onClick={() => setActiveTab("completed")} className={`min-w-36 rounded-md cursor-pointer px-5 py-2 text-xs font-black transition ${activeTab === "completed" ? "bg-red-50 text-red-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>Completed ({completedRequests.length})</button>
        </div>

        {visibleRequests.length ? (
          visibleRequests.map((request) => activeTab === "completed" ? (
            <CompletedBloodRequestCard key={request._id} request={request} />
          ) : (
            <BloodRequestCard
              key={request._id}
              request={request}
              isUpdating={updatingRequestId === request._id}
              onApprove={handleApprove}
              onReject={handleReject}
              onReadyToDispatch={handleReadyToDispatch}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <ClipboardList className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-base font-black text-slate-950">No {activeTab} requests yet</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              New user requests for your blood bank will appear here.
            </p>
          </div>
        )}
      </div>
      </section>

      {rejectionRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rejection-dialog-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.2)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <MessageSquareText className="size-5" />
                </div>
                <h2 id="rejection-dialog-title" className="text-lg font-black text-slate-950">
                  Reason for rejection
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Add a short reason for request {rejectionRequest.requestNumber || ""}.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close rejection dialog"
                onClick={() => setRejectionRequest(null)}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter the reason for rejecting this request"
              rows={4}
              autoFocus
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectionRequest(null)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim() || updatingRequestId === rejectionRequest._id}
                onClick={confirmRejection}
                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(220,38,38,0.2)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {updatingRequestId === rejectionRequest._id ? <LoaderCircle className="size-4 animate-spin" /> : <X className="size-4" />}
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
