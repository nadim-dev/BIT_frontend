import { useEffect, useState } from "react";
import { Check, Circle, Droplet, LoaderCircle, MapPin, Phone, Truck, X } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { confirmDelivery, generateDeliveryOtp, getMyBloodRequestTracking } from "../api/bloodBankApi.js";
import { formatTicketDate } from "../utils/dateCustomization.js";

const labels = {
  Assigned: ["Delivery Partner Assigned", "A delivery partner accepted your request"],
  OnTheWayToPickup: ["On the Way to Pickup", "Delivery partner is on the way to the blood bank"],
  PickedUp: ["Blood Picked Up", "Blood has been collected from the blood bank"],
  OutForDelivery: ["Out for Delivery", "Your blood is on the way to you"],
  Delivered: ["Delivered", "Your blood has been delivered"],
};

const addressText = (address = {}) => [address.completeAddress, address.city, address.district, address.state, address.pincode].filter(Boolean).join(", ") || "Address unavailable";

function Timeline({ request }) {
  const { bloodrequestId } = useParams();
  const [showConfirmModal, setShowConfirmModalState] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [otpError, setOtpError] = useState("");
  const setShowConfirmModal = async (shouldShow) => {
    if (!shouldShow) {
      setShowConfirmModalState(false);
      return;
    }
    try {
      setIsGeneratingOtp(true);
      const response = await generateDeliveryOtp(bloodrequestId);
      setDeliveryOtp(response.otp || "");
    } catch (error) {
      setOtpError(error.message || "Unable to generate delivery OTP.");
    } finally {
      setIsGeneratingOtp(false);
    }
  };
  const events = [
    ...(request.statusHistory || []).map((entry) => ({ status: entry.status, title: entry.status === "Approved" ? "Request Approved" : entry.status, description: entry.status === "Approved" ? "Blood bank approved your request" : `Request status: ${entry.status}`, changedAt: entry.changedAt })),
    ...(request.deliveryStatusHistory || []).map((entry) => ({ status: entry.status, title: labels[entry.status]?.[0] || entry.status, description: labels[entry.status]?.[1] || "Delivery status updated", changedAt: entry.changedAt })),
  ].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

  return (
    <>
    {request.deliveryStatus === "OutForDelivery" ? <section className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div><p className="text-sm font-black text-slate-950">Delivery verification</p><p className="mt-1 text-xs font-semibold text-slate-600">Generate an OTP to share with the delivery partner.</p>{deliveryOtp ? <p className="mt-2 text-lg font-black tracking-[0.25em] text-blue-700">OTP: {deliveryOtp}</p> : null}</div><button type="button" onClick={() => setShowConfirmModal(true)} disabled={isGeneratingOtp} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50">{isGeneratingOtp ? "Generating..." : "Generate OTP"}</button></section> : null}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Live status</p>
        <h2 className="mt-1 text-base font-black text-slate-950">Delivery Progress</h2>
      </div>
      <div className="space-y-5 px-5 py-5">
        {events.map((event, index) => {
          const current = event.status === request.deliveryStatus;
          return (
            <div key={`${event.title}-${event.changedAt}`} className="relative flex gap-3">
              {index < events.length - 1 ? <span className="absolute left-[11px] top-7 h-[calc(100%+20px)] w-px bg-slate-200" /> : null}
              <div className={`relative min-w-0 flex-1 rounded-xl border px-3 py-2.5 pl-12 ${current ? "border-red-100 bg-red-50/60" : "border-slate-100 bg-white"}`}>
                <span className={`absolute left-3 top-1/2 z-10 grid size-6 -translate-y-1/2 place-items-center rounded-full ${current ? "bg-red-600 text-white shadow-[0_0_0_4px_rgba(220,38,38,0.1)]" : "bg-emerald-500 text-white"}`}>
                  {current ? <Truck className="size-3.5" /> : <Check className="size-3.5" />}
                </span>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className={`text-sm font-black ${current ? "text-red-700" : "text-slate-800"}`}>{event.title}</p>
                  <p className="text-[10px] font-bold text-slate-400">{formatTicketDate(event.changedAt, "Time unavailable")}</p>
                </div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{event.description}</p>
              </div>
            </div>
          );
        })}
        {request.deliveryStatus !== "Delivered" ? <div className="relative rounded-xl border border-dashed border-slate-200 py-2.5 pl-12 pr-3"><Circle className="absolute left-3 top-1/2 size-6 -translate-y-1/2 text-slate-300" /><p className="text-sm font-black text-slate-500">Delivered</p><p className="mt-1 text-xs font-semibold text-slate-400">Your blood will be delivered soon</p></div> : null}
      </div>
    </section>
    {showConfirmModal ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-lg font-black text-slate-950">Confirm Delivery</p><p className="mt-1 text-sm font-semibold text-slate-500">Payment: {request.payment?.amount ? `Rs. ${request.payment.amount}` : "Amount unavailable"} <span className="mx-1">•</span> {request.payment?.collectionMethod || "Cash"}</p><p className="mt-2 text-sm font-black text-emerald-600">✓ Payment collected</p></div><button type="button" onClick={() => setShowConfirmModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button></div><div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Delivery Verification</p><p className="mt-3 text-sm font-bold leading-6 text-slate-700">Ask the patient for their delivery OTP before confirming.</p></div><button type="button" onClick={() => { setShowConfirmModal(false); setShowOtpModal(true); setOtpError(""); }} className="mt-5 w-full rounded-lg bg-blue-600 py-3 text-sm font-black text-white">Continue</button></div></div> : null}
    {showOtpModal ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><p className="text-lg font-black text-slate-950">Enter Delivery OTP</p><button type="button" onClick={() => setShowOtpModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button></div><p className="mt-2 text-sm font-semibold text-slate-500">Enter the OTP provided by the patient.</p><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} autoFocus className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-xl font-black tracking-[0.4em] outline-none focus:border-blue-500" placeholder="------" />{otpError ? <p className="mt-2 text-xs font-bold text-red-600">{otpError}</p> : null}<button type="button" disabled={otp.length !== 6 || isConfirming} onClick={async () => { try { setIsConfirming(true); await confirmDelivery(bloodrequestId, otp); setShowOtpModal(false); } catch (error) { setOtpError(error.message || "Unable to confirm delivery."); } finally { setIsConfirming(false); } }} className="mt-5 w-full rounded-lg bg-blue-600 py-3 text-sm font-black text-white disabled:opacity-50">{isConfirming ? "Confirming..." : "Confirm Delivery"}</button></div></div> : null}
    </>
  );
}

export const TrackingUserOrder = () => {
  const { bloodrequestId } = useParams();
  const { setHeaderContent, deliveryPartnerSocket } = useOutletContext();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");
  const [deliveryOtp, setDeliveryOtp] = useState("");
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);

  useEffect(() => { setHeaderContent({ title: "Track Request", subtitle: "Follow your blood request and delivery progress", action: undefined }); }, [setHeaderContent]);
  useEffect(() => { getMyBloodRequestTracking(bloodrequestId).then((response) => setRequest(response.bloodRequest)).catch((err) => setError(err.message || "Unable to load request tracking.")); }, [bloodrequestId]);

  useEffect(() => {
    if (!deliveryPartnerSocket) return;

    const handleDeliveryStatusUpdated = (statusUpdate) => {
      if (String(statusUpdate.bloodRequestId) !== String(bloodrequestId)) return;
      setRequest((currentRequest) => currentRequest ? {
        ...currentRequest,
        deliveryStatus: statusUpdate.deliveryStatus,
        requestStatus: statusUpdate.requestStatus || currentRequest.requestStatus,
        deliveryStatusHistory: statusUpdate.deliveryStatus === "Delivered"
          ? [...(currentRequest.deliveryStatusHistory || []), { status: "Delivered", changedAt: new Date().toISOString() }]
          : currentRequest.deliveryStatusHistory,
      } : currentRequest);
    };

    deliveryPartnerSocket.on("deliveryStatusUpdated", handleDeliveryStatusUpdated);
    return () => deliveryPartnerSocket.off("deliveryStatusUpdated", handleDeliveryStatusUpdated);
  }, [deliveryPartnerSocket, bloodrequestId]);

  const handleGenerateDeliveryOtp = async () => {
    try {
      setIsGeneratingOtp(true);
      setError("");
      const response = await generateDeliveryOtp(bloodrequestId);
      setDeliveryOtp(response.otp || "");
    } catch (err) {
      setError(err.message || "Unable to generate delivery OTP.");
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  if (error) return <section className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">{error}</section>;
  if (!request) return <section className="flex min-h-64 items-center justify-center text-sm font-bold text-slate-500"><LoaderCircle className="mr-2 size-5 animate-spin text-red-600" />Loading request tracking...</section>;

  const item = request.items?.[0] || {};
  const bank = request.bloodBankId || {};
  const partner = request.deliveryPartnerId;
  const currentLabel = labels[request.deliveryStatus];

  return <main className="mx-auto max-w-4xl space-y-3 py-3"><section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-xl bg-red-50 text-red-600"><Droplet className="size-6 fill-current" /></span><div><p className="font-mono text-base font-black text-slate-950">{request.requestNumber}</p><div className="mt-1 flex gap-1.5 text-[10px] font-black"><span className="rounded bg-red-50 px-2 py-1 text-red-700">{item.bloodGroup || "Mixed"}</span><span className="rounded bg-rose-50 px-2 py-1 text-rose-700">{item.component || "Multiple"}</span><span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{item.quantity || 0} Unit</span></div><p className="mt-2 text-[11px] font-bold text-slate-500">Requested from <b className="text-slate-950">{bank.bloodBankName || "Blood bank"}</b></p></div></div><div className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-700"><p className="text-xs font-black">{currentLabel?.[0] || request.requestStatus}</p><p className="mt-1 text-[11px] font-semibold">{currentLabel?.[1] || "Your request is being processed"}</p></div></section><Timeline request={request} /><section className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-red-100 bg-red-50/50 p-4"><p className="text-[10px] font-black uppercase text-red-600">Pickup Location</p><p className="mt-2 text-sm font-black text-slate-950">{bank.bloodBankName || "Blood bank"}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{addressText(bank.address)}</p></div><div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"><p className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600"><MapPin className="size-4" />Delivery Location</p><p className="mt-2 text-sm font-black text-slate-950">{request.patient?.name || "Recipient"}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{addressText(request.deliveryAddress)}</p></div></section>{partner ? <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div><p className="text-sm font-black text-slate-950">Delivery Partner</p><p className="mt-1 text-sm font-black text-slate-700">{partner.fullName}</p><p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Phone className="size-3.5" />{partner.phoneNumber || "Phone unavailable"}</p></div>{partner.phoneNumber ? <a href={`tel:${partner.phoneNumber}`} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-xs font-black text-red-600"><Phone className="size-4" />Call</a> : null}</section> : null}</main>;
};
