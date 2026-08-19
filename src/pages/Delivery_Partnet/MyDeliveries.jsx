import { useEffect, useMemo, useState } from "react";
import { Check, Circle, CreditCard, Droplet, Eye, Hospital, MapPin, Navigation, PackageCheck, Phone, Play, UserRound, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { confirmDelivery, confirmPickup, completeDelivery, getActiveRequest, getCompletedDeliveries, startJourney, startDelivery } from "../../api/bloodBankApi.js";
import { formatTicketDate } from "../../utils/dateCustomization.js";

const deliverySteps = [
  { key: "Assigned", label: "Assigned" },
  { key: "OnTheWayToPickup", label: "On the Way to Pickup" },
  { key: "PickedUp", label: "Picked Up" },
  { key: "OutForDelivery", label: "Out for Delivery" },
  { key: "Delivered", label: "Delivered" },
];


const completedByStatus = {
  Assigned: 1,
  OnTheWayToPickup: 2,
  PickedUp: 3,
  OutForDelivery: 4,
  Delivered: 5,
};

const getDeliveryStatusLabel = (status) =>
  deliverySteps.find((step) => step.key === status)?.label || status || "Assigned";

const getTotalUnits = (items = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0), 0);

const formatItems = (items = []) => {
  if (!items.length) return "Blood details unavailable";

  return items
    .map((item) => `${item.bloodGroup || ""} ${item.component || ""}`.trim())
    .filter(Boolean)
    .join(", ");
};

const formatAddress = (address = {}) =>
  [address.completeAddress, address.city, address.state, address.pincode].filter(Boolean).join(", ");

const formatPaymentMethod = (method) => {
  if (method === "PayOnDelivery") return "Pay on Delivery";
  return method || "Payment details unavailable";
};

const formatDistance = (distance) => {
  const distanceMeters = Number(distance?.distanceMeters ?? distance);
  if (!Number.isFinite(distanceMeters)) return "Distance unavailable";

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(2)} km`;
};

const getAssignedAt = (activeDelivery, deliveryRequest) => {
  const assignedEntry = activeDelivery?.deliveryStatusHistory?.find(
    (entry) => entry.status === "Assigned",
  );

  return deliveryRequest?.respondedAt || assignedEntry?.changedAt || activeDelivery?.updatedAt;
};

function LocationBlock({ icon: Icon, label, title, address, distance, tone }) {
  const toneClasses =
    tone === "pickup"
      ? "bg-red-50 text-red-600 ring-red-100"
      : "bg-emerald-50 text-emerald-600 ring-emerald-100";

  return (
    <div className="grid min-w-0 grid-cols-[38px_1fr] gap-3 rounded-lg bg-slate-50/80 p-3 ring-1 ring-slate-100">
      <span className={`grid size-9 place-items-center rounded-lg ring-1 ${toneClasses}`}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className={`text-[10px] font-black uppercase ${tone === "pickup" ? "text-red-600" : "text-emerald-600"}`}>
          {label}
        </p>
        <h3 className="mt-1 truncate text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-1 truncate text-xs font-semibold text-slate-500">{address}</p>
        <p className={`mt-1.5 flex items-center gap-1 text-xs font-black ${tone === "pickup" ? "text-red-600" : "text-emerald-600"}`}>
          <MapPin className="size-3.5" />
          {distance}
        </p>
      </div>
    </div>
  );
}

function ProgressBar({ status }) {
  const completedCount = completedByStatus[status] || 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white px-5 py-3">
      <div className="grid min-w-[620px] grid-cols-5 gap-2">
        {deliverySteps.map((step, index) => {
          const isCompleted = index < completedCount;
          const isCurrent = index === completedCount - 1;

          return (
            <div key={step.key} className="relative flex flex-col items-center gap-1.5">
              {index > 0 && (
                <span
                  className={`absolute right-1/2 top-[5px] h-0.5 w-full ${index < completedCount ? "bg-red-500" : "bg-slate-200"}`}
                />
              )}
              <span
                className={`relative z-10 size-3 rounded-full ring-4 ring-white ${
                  isCompleted ? "bg-red-600" : "bg-slate-300"
                }`}
              />
              <span className={`whitespace-nowrap text-center text-[11px] font-black ${isCurrent ? "text-red-600" : "text-slate-500"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentDetailsModel({setShowPaymentModel, activeDelivery, onConfirmed}){
  console.log("activeRequestDetails",activeDelivery);
  const [collectionMethod, setCollectionMethod] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp,setOtp]=useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (otp.length > 4) setOtp(otp.slice(0, 4));
  }, [otp]);

   const handleContinue=()=>{
       if (!collectionMethod)
        return
       setShowOtpModal(true);
       setError("");
   }

  const handleConfirmDelivery = async () => {
    if (otp.length !== 4) {
      setError("Enter a 4-digit OTP.");
      return;
    }
    try {
      setIsConfirming(true);
      setError("");
      await confirmDelivery(activeDelivery._id, otp, collectionMethod);
      onConfirmed();
      setShowOtpModal(false);
      setShowPaymentModel(false);
    } catch (err) {
      setError(err.message || "Unable to confirm delivery.");
    } finally {
      setIsConfirming(false);
    }
  };

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
      <div className="flex items-center justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Delivery verification</p><p className="mt-1 text-xl font-black">Confirm Delivery</p></div>
        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={()=>setShowPaymentModel(false)} aria-label="Close confirm delivery">
           <X size={24} strokeWidth={1.8} />
        </button>
      </div>
      <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm font-black text-slate-700">{activeDelivery.requestNumber}</p>
      {activeDelivery.items.map((item)=>{
          return (
            <p key={`${item.bloodGroup}-${item.component}`} className="mt-2 text-sm font-black"><span className="mr-2">{item.bloodGroup}</span><span className="mr-2">{item.component}</span><span>{item.quantity} Unit</span></p>
          )
      })
      
      }
      <h4 className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Payment</h4>
      <p className="mt-2 text-xs font-bold text-slate-500">Collection Amount</p>
      <p className="text-sm">₹{activeDelivery.payment.amount}</p>
       <div className="mt-3 flex items-center gap-8">
    <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
      <input
        type="radio"
        name="collectionMethod"
        value="Cash"
        checked={collectionMethod === "Cash"}
        onChange={(e) => setCollectionMethod(e.target.value)}
      />
      <span>Cash</span>
    </label>

    <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
      <input
        type="radio"
        name="collectionMethod"
        value="UPI"
        checked={collectionMethod === "UPI"}
        onChange={(e) => setCollectionMethod(e.target.value)}
      />
      <span>UPI</span>
    </label>
  </div>
  <button disabled={!collectionMethod} className="mt-5 w-full rounded-lg bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" onClick={()=>handleContinue()}>Continue</button>
    </section>
    {showOtpModal ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.24)]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Delivery verification</p><p className="mt-1 text-xl font-black">Confirm Delivery</p></div><button type="button" onClick={() => setShowOtpModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button></div><div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-black text-slate-800">Payment: Rs. {activeDelivery.payment.amount} <span className="mx-1">•</span> {collectionMethod}</p><p className="mt-2 text-sm font-black text-emerald-600">✓ Payment collected</p></div><div className="mt-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Delivery verification</p><p className="mt-2 text-sm font-bold leading-6 text-slate-700">Ask the patient for their delivery OTP.</p><input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" maxLength={4} autoFocus className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-xl font-black tracking-[0.4em] outline-none focus:border-blue-500" placeholder="----" /></div>{error ? <p className="mt-2 text-xs font-bold text-red-600">{error}</p> : null}<button type="button" disabled={otp.length !== 4 || isConfirming} onClick={handleConfirmDelivery} className="mt-5 w-full rounded-lg bg-blue-600 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{isConfirming ? "Confirming..." : "Confirm Delivery"}</button></section></div> : null}
    </div>
  )
}

function DeliveryDetailsModal({ activeDelivery, status, onClose }) {
  const completedCount = completedByStatus[status] || 0;
  const deliveryAddress = formatAddress(activeDelivery.deliveryAddress);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white text-slate-950 shadow-[0_24px_70px_rgba(127,29,29,0.24)]">
        <div className="flex items-center justify-between border-b border-red-100 bg-gradient-to-r from-red-50 via-white to-rose-50 px-5 py-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600">Active Job</p>
            <h2 className="text-lg font-black text-slate-950">Delivery Details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 cursor-pointer place-items-center rounded-full border border-red-100 bg-white text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
            aria-label="Close delivery details"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-3 bg-slate-50/80 px-5 py-4">
          <div className="rounded-xl border border-red-100 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Patient</h3>
            <div className="mt-2 grid gap-1.5">
              <p className="flex items-center gap-3 text-base font-black text-slate-950">
                <span className="grid size-8 place-items-center rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100">
                  <UserRound className="size-4" />
                </span>
                {activeDelivery.patient?.name || "Patient name unavailable"}
              </p>
              <p className="flex flex-wrap items-center gap-3 text-base font-black text-slate-950">
                <span className="grid size-8 place-items-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                  <Phone className="size-4" />
                </span>
                <span>{activeDelivery.patient?.contactNumber || "Contact unavailable"}</span>
                {activeDelivery.patient?.contactNumber && (
                  <a
                    href={`tel:${activeDelivery.patient.contactNumber}`}
                    className="ml-auto rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-black text-red-700 transition hover:bg-red-100"
                  >
                    Call
                  </a>
                )}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Delivery Address</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{deliveryAddress || "Delivery address unavailable"}</p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Payment</h3>
            <p className="mt-2 flex items-center gap-3 text-base font-black text-slate-950">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CreditCard className="size-4" />
              </span>
              {formatPaymentMethod(activeDelivery.payment?.method)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Delivery Timeline</h3>
            <div className="mt-2 grid gap-1.5">
              {deliverySteps.map((step, index) => {
                const isDone = index < completedCount;

                return (
                  <div key={step.key} className="flex items-center gap-3 text-sm font-black text-slate-800">
                    {isDone ? (
                      <span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <Check className="size-4" />
                      </span>
                    ) : (
                      <Circle className="ml-1 size-4 text-slate-400" />
                    )}
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActiveDeliveryCard({ activeDelivery, deliveryRequest }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isStartingJourney, setIsStartingJourney] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(activeDelivery.deliveryStatus);
  const [startJourneyError, setStartJourneyError] = useState("");
  const [isConfirmingPickup, setIsConfirmingPickup] = useState(false);
  const [isStartingDelivery, setIsStartingDelivery] = useState(false);
  const [showPaymentModel,setShowPaymentModel]=useState(false);
  const totalUnits = getTotalUnits(activeDelivery.items);
  const acceptedAt = getAssignedAt(activeDelivery, deliveryRequest);
  const pickupAddress = formatAddress(activeDelivery.bloodBankId?.address);
  const deliveryAddress = formatAddress(activeDelivery.deliveryAddress);

  const handleStartJourney = async () => {
    try {
      setIsStartingJourney(true);
      setStartJourneyError("");
      await startJourney(activeDelivery._id);
      setDeliveryStatus("OnTheWayToPickup");
    } catch (err) {
      setStartJourneyError(err.message || "Unable to start journey.");
    } finally {
      setIsStartingJourney(false);
    }
  };

  const handleConfirmPickup = async () => {
    const otp = window.prompt("Enter the pickup OTP from the blood bank:");
    if (!otp) return;

    try {
      setIsConfirmingPickup(true);
      setStartJourneyError("");
      await confirmPickup(activeDelivery._id, otp.trim());
      setDeliveryStatus("PickedUp");
    } catch (err) {
      setStartJourneyError(err.message || "Unable to confirm pickup.");
    } finally {
      setIsConfirmingPickup(false);
    }
  };

  const handleStartDelivery = async () => {
    try {
      setIsStartingDelivery(true);
      setStartJourneyError("");
      await startDelivery(activeDelivery._id);
      setDeliveryStatus("OutForDelivery");
    } catch (err) {
      setStartJourneyError(err.message || "Unable to start delivery.");
    } finally {
      setIsStartingDelivery(false);
    }
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_12px_26px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600 ring-1 ring-red-100">
            <Droplet className="size-5 fill-current" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-slate-950">
              {activeDelivery.requestNumber || "Active delivery"}
            </h2>
            <p className="mt-1 text-xs font-black text-slate-500">
              {totalUnits} Unit{totalUnits === 1 ? "" : "s"} <span className="px-1 text-slate-300">•</span>{" "}
              {formatItems(activeDelivery.items)}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase text-amber-700">
            <span className="size-2 rounded-full bg-amber-500" />
            {getDeliveryStatusLabel(deliveryStatus)}
          </span>
                <p className="mt-2 text-[11px] font-bold text-slate-500">Accepted at {formatTicketDate(acceptedAt, "Time unavailable")}</p>
        </div>
      </div>

      <div className="my-3 h-px bg-slate-100" />

      <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_42px_minmax(0,1fr)]">
        <LocationBlock
          icon={Hospital}
          label="Pickup Location"
          title={activeDelivery.bloodBankId?.bloodBankName || "City Blood Bank"}
          address={pickupAddress || "Pickup address unavailable"}
          distance={formatDistance(deliveryRequest?.distanceToPickup)}
          tone="pickup"
        />

        <div className="hidden items-center justify-center lg:flex">
          <span className="grid size-8 place-items-center rounded-full border border-red-100 bg-white text-red-600 shadow-sm">
            <Navigation className="size-3.5" />
          </span>
        </div>

        <LocationBlock
          icon={UserRound}
          label="Delivery Location"
          title={activeDelivery.patient?.name || "Patient delivery"}
          address={deliveryAddress || "Delivery address unavailable"}
          distance={formatDistance(deliveryRequest?.distanceToDelivery)}
          tone="delivery"
        />
      </div>

      <div className="mt-3">
        <ProgressBar status={deliveryStatus} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2 text-xs font-black text-red-600 transition hover:bg-red-50"
          >
            <Eye className="size-4" />
            View Details
          </button>
          {deliveryStatus === "Assigned" ? (
            <button
              type="button"
              onClick={handleStartJourney}
              disabled={isStartingJourney}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-600 bg-red-600 px-5 py-2 text-xs font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="size-4" />
              {isStartingJourney ? "Starting..." : "Start Journey"}
            </button>
          ) : deliveryStatus === "OnTheWayToPickup" ? (
            <button
              type="button"
              onClick={handleConfirmPickup}
              disabled={isConfirmingPickup}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-5 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
            >
              <Check className="size-4" />
              {isConfirmingPickup ? "Confirming..." : "Confirm Pickup"}
            </button>
          ) : deliveryStatus === "PickedUp" ? (
            <button
              type="button"
              onClick={handleStartDelivery}
              disabled={isStartingDelivery}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-5 py-2 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="size-4" />
              {isStartingDelivery ? "Starting..." : "Start Delivery"}
            </button>
          ) : deliveryStatus === "OutForDelivery" ? (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-5 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
              onClick={()=>setShowPaymentModel(true)}
            >
              <Check className="size-4" />
              Mark Delivered
            </button>
          ) : null}
        </div>
        {startJourneyError && <p className="text-xs font-bold text-red-600">{startJourneyError}</p>}
      </div>

      {showDetails && (
        <DeliveryDetailsModal
          activeDelivery={activeDelivery}
          status={deliveryStatus}
          onClose={() => setShowDetails(false)}
        />
      )}

      {
        showPaymentModel &&(
          <PaymentDetailsModel
            setShowPaymentModel={setShowPaymentModel}
            activeDelivery={activeDelivery}
            onConfirmed={() => setDeliveryStatus("Delivered")}
          />
        )
      }
    </article>
  );
}

function CompletedDeliveryCard({ delivery }) {
  const item = delivery.items?.[0] || {};
  const pickup = formatAddress(delivery.bloodBankId?.address);
  const destination = formatAddress(delivery.deliveryAddress);
  const distance = delivery.deliveryRequest?.distanceToDelivery;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Check className="size-5" />
          </span>
          <div>
            <p className="text-sm font-black text-slate-950">Completed</p>
            <p className="mt-1 font-mono text-xs font-black text-slate-500">Delivery #{delivery.requestNumber || "Unavailable"}</p>
          </div>
        </div>
        <p className="text-xs font-bold text-slate-500">{formatTicketDate(delivery.updatedAt, "Date unavailable")}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-black text-slate-800">
        <span>Delivered by {delivery.deliveryPartner?.fullName || "delivery partner unavailable"}</span>
        <span className="text-slate-300">•</span>
        <span>{item.bloodGroup || "Mixed"} {item.component || "Blood"}</span>
      </div>
      <p className="mt-1 text-xs font-bold text-slate-500">Quantity: {item.quantity || 0} Unit{Number(item.quantity) === 1 ? "" : "s"}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"><p className="text-[10px] font-black uppercase text-red-600">Pickup</p><p className="mt-1 text-xs font-black text-slate-800">{delivery.bloodBankId?.bloodBankName || "Blood bank"}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{pickup}</p></div>
        <span className="hidden text-xl text-slate-400 sm:block">→</span>
        <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100"><p className="text-[10px] font-black uppercase text-emerald-600">Delivery</p><p className="mt-1 text-xs font-black text-slate-800">{delivery.patient?.name || "Recipient"}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{destination}</p></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-slate-100 pt-3 text-xs font-black text-slate-600"><span>Collection: Rs. {delivery.payment?.amount ?? "-"}</span><span>{delivery.payment?.collectionMethod || "Payment unavailable"}</span><span>Distance: {formatDistance(distance)}</span></div>
    </article>
  );
}

export const MyDeliveries = () => {
  const { setHeaderContent } = useOutletContext();
  const [activeRequestDetails, setActiveRequestDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    setHeaderContent({
      title: "My Deliveries",
      subtitle: "Your active and completed delivery jobs",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchActiveRequest = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [activeData, completedData] = await Promise.all([getActiveRequest(), getCompletedDeliveries()]);
        setActiveRequestDetails(activeData);
        setCompletedDeliveries(completedData.completedDeliveries || []);
      } catch (err) {
        setError(err.message || "Unable to load active delivery.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveRequest();
  }, []);

  const activeDelivery = activeRequestDetails?.activeDelivery;
  const deliveryRequest = activeRequestDetails?.deliveryRequest;
  const activeCount = activeDelivery ? 1 : 0;

  const tabs = useMemo(
    () => [
      { label: `Active (${activeCount})`, active: true },
      { key: "completed", label: `Completed (${completedDeliveries.length})` },
    ],
    [activeCount, completedDeliveries.length],
  );

  return (
    <main className="space-y-4">
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key || "active"}
            type="button"
            onClick={() => setActiveTab(tab.key || "active")}
            className={`min-w-32 rounded-md px-5 py-2 text-xs font-black transition ${
              activeTab === (tab.key || "active") ? "bg-red-50 text-red-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <PackageCheck className="mx-auto size-8 text-red-500" />
          <h2 className="mt-3 text-base font-black text-slate-950">Loading active delivery</h2>
        </section>
      )}

      {!isLoading && error && (
        <section className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
          {error}
        </section>
      )}

      {!isLoading && !error && activeTab === "active" && activeDelivery && (
        <ActiveDeliveryCard activeDelivery={activeDelivery} deliveryRequest={deliveryRequest} />
      )}

      {!isLoading && !error && activeTab === "completed" && completedDeliveries.length > 0 && completedDeliveries.map((delivery) => (
        <CompletedDeliveryCard key={delivery._id} delivery={delivery} />
      ))}

      {!isLoading && !error && activeTab === "active" && !activeDelivery && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <PackageCheck className="mx-auto size-9 text-slate-400" />
          <h2 className="mt-3 text-base font-black text-slate-950">No active delivery</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">Accepted deliveries will appear here.</p>
        </section>
      )}

      {!isLoading && !error && activeTab === "completed" && !completedDeliveries.length && (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"><PackageCheck className="mx-auto size-9 text-slate-400" /><h2 className="mt-3 text-base font-black text-slate-950">No completed deliveries</h2><p className="mt-1 text-sm font-semibold text-slate-500">Completed delivery jobs will appear here.</p></section>
      )}
    </main>
  );
};
