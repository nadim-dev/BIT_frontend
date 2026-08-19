import { useEffect, useMemo, useState } from "react";
import { AlertCircle, MapPin, PackageCheck, Route, Truck } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { getPendingDeliveryRequests,declineDeliveryRequest,acceptDeliveryRequest } from "../../api/deliveryApi";


const getTotalUnits = (items = []) =>
  items.reduce((total, item) => total + Number(item.quantity || 0), 0);

const formatRouteDistance = (route) => {
  const distanceKm = Number(route?.distanceKm ?? route);

  if (!Number.isFinite(distanceKm)) return "Distance unavailable";

  return `${distanceKm} km`;
};

const getDeliveryRequestId = (request = {}) =>
  request.deliveryRequestId || request._id || request.requestId || request.bloodRequestId?._id;

const getBloodRequestId = (request = {}) =>
  request.requestId || request.bloodRequestId?._id || request.bloodRequestId;

const normalizeDeliveryRequest = (request = {}) => {
  const bloodRequest = request.bloodRequestId || request;
  const bloodBank = bloodRequest.bloodBankId || {};

  return {
    ...request,
    deliveryRequestId: request._id || request.deliveryRequestId,
    requestId: bloodRequest._id || request.requestId,
    requestNumber: bloodRequest.requestNumber || request.requestNumber,
    items: bloodRequest.items || request.items || [],
    pickup: request.pickup || {
      name: bloodBank.bloodBankName,
      address: bloodBank.address?.completeAddress || bloodBank.address,
      location: bloodBank.location,
    },
    delivery: request.delivery || {
      address: bloodRequest.deliveryAddress?.completeAddress,
      city: bloodRequest.deliveryAddress?.city,
      location: bloodRequest.deliveryAddress?.location,
    },
    receivedAt: request.sentAt || request.createdAt || new Date().toISOString(),
  };
};

function BloodItems({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm font-bold text-slate-500">Blood details unavailable</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item.bloodGroup}-${item.component}-${index}`}
          className="inline-flex items-center rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-black text-red-700"
        >
          {item.quantity} {item.bloodGroup} {item.component}
        </span>
      ))}
    </div>
  );
}

function DeliveryRequestCard({ request, onAccepted, onDeclined }) {
  const totalUnits = getTotalUnits(request.items);
  const distanceToDelivery = request.distanceToDelivery || request.distanceToDeliver;
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleDeclineRequest=async ()=>{
    const requestId = getDeliveryRequestId(request);
    console.log("Handle decline request controller is running");
    console.log("deliveryPartnerId",requestId);
    try{
      setIsDeclining(true);
      await declineDeliveryRequest(requestId);
      onDeclined(requestId);
    }catch(err){
      console.log(err.message);
    } finally {
      setIsDeclining(false);
    }
  }

  const handleAcceptRequest = async () => {
    const requestId = getDeliveryRequestId(request);

    try {
      setIsAccepting(true);
      await acceptDeliveryRequest(requestId);
      onAccepted(requestId);
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Truck className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-black text-slate-950">
                {request.requestNumber || "New delivery request"}
              </h2>
              <p className="text-xs font-bold text-slate-500">
                {totalUnits} unit{totalUnits === 1 ? "" : "s"} ready for pickup
              </p>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
        {request.distanceToPickup > 999 ? `${(request.distanceToPickup / 1000).toFixed(2)} km` : `${request.distanceToPickup} m`}
        </span>
      </div>

      <div className="mt-4">
        <BloodItems items={request.items} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400">
            <PackageCheck className="size-3.5 text-blue-600" />
            Pickup
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">{request.pickup?.name || "Blood bank"}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {request.pickup?.address || "Pickup address unavailable"}
          </p>
          <p className="mt-2 text-xs font-black text-blue-700">
            {request.distanceToPickup > 999 ? `${(request.distanceToPickup / 1000).toFixed(2)} km` : `${request.distanceToPickup} m`}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase text-slate-400">
            <MapPin className="size-3.5 text-red-600" />
            Delivery
          </p>
          <p className="mt-1 text-sm font-black text-slate-950">{request.delivery?.city || "Destination"}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            {request.delivery?.address || "Delivery address unavailable"}
          </p>
          <p className="mt-2 text-xs font-black text-red-700">
            {request.distanceToDelivery > 999 ? `${(request.distanceToDelivery / 1000).toFixed(2)} km` : `${request.distanceToDelivery} m`} to delivery
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={handleDeclineRequest}
          disabled={isAccepting || isDeclining}
          className="rounded-lg cursor-pointer border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
        >
          {isDeclining ? "Declining..." : "Decline"}
        </button>
        <button
          type="button"
          onClick={handleAcceptRequest}
          disabled={isAccepting || isDeclining}
          className="rounded-lg cursor-pointer border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
        >
          {isAccepting ? "Accepting..." : "Accept Delivery"}
        </button>
      </div>
    </article>
  );
}

export const DeliveryRequest = () => {
  const { setHeaderContent, deliveryPartnerSocket } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Delivery Requests",
      subtitle: "Live blood delivery assignments from blood banks",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    let isMounted = true;

    const fetchPendingRequests = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPendingDeliveryRequests();

        if (!isMounted) return;

        setRequests((response.deliveryRequests || []).map(normalizeDeliveryRequest));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Unable to load pending delivery requests.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPendingRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!deliveryPartnerSocket) return;

    const handleNewDeliveryRequest = (request) => {
      const normalizedRequest = normalizeDeliveryRequest(request);

      setRequests((currentRequests) => {
        const requestId = getDeliveryRequestId(normalizedRequest);
        const alreadyExists = currentRequests.some(
          (currentRequest) => getDeliveryRequestId(currentRequest) === requestId,
        );

        if (alreadyExists) return currentRequests;

        return [{ ...normalizedRequest, receivedAt: new Date().toISOString() }, ...currentRequests];
      });
    };

    const handleDeliveryRequestExpired = ({ deliveryRequestId, bloodRequestId }) => {
      setRequests((currentRequests) =>
        currentRequests.filter((request) => {
          const currentDeliveryRequestId = String(getDeliveryRequestId(request) || "");
          const currentBloodRequestId = String(getBloodRequestId(request) || "");

          return (
            currentDeliveryRequestId !== String(deliveryRequestId || "") &&
            currentBloodRequestId !== String(bloodRequestId || "")
          );
        }),
      );
    };

    deliveryPartnerSocket.on("newDeliveryRequest", handleNewDeliveryRequest);
    deliveryPartnerSocket.on("deliveryRequestExpired", handleDeliveryRequestExpired);

    return () => {
      deliveryPartnerSocket.off("newDeliveryRequest", handleNewDeliveryRequest);
      deliveryPartnerSocket.off("deliveryRequestExpired", handleDeliveryRequestExpired);
    };
  }, [deliveryPartnerSocket]);

  const sortedRequests = useMemo(
    () => [...requests].sort((first, second) => new Date(second.receivedAt) - new Date(first.receivedAt)),
    [requests],
  );

  const handleRequestDeclined = (declinedRequestId) => {
    setRequests((currentRequests) =>
      currentRequests.filter((request) => getDeliveryRequestId(request) !== declinedRequestId),
    );
  };

  const handleRequestAccepted = (acceptedRequestId) => {
    setRequests((currentRequests) =>
      currentRequests.filter((request) => getDeliveryRequestId(request) !== acceptedRequestId),
    );
  };

  if (isLoading) {
    return (
      <section className="flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <Truck className="size-6" />
          </span>
          <h1 className="mt-4 text-base font-black text-slate-950">Loading delivery requests</h1>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Checking pending assignments from the server.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-red-600 ring-1 ring-red-100">
            <AlertCircle className="size-6" />
          </span>
          <h1 className="mt-4 text-base font-black text-slate-950">Unable to load delivery requests</h1>
          <p className="mt-1 text-sm font-semibold leading-6 text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  if (!sortedRequests.length) {
    return (
      <section className="flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-blue-600 ring-1 ring-slate-200">
            <Route className="size-6" />
          </span>
          <h1 className="mt-4 text-base font-black text-slate-950">Waiting for delivery requests</h1>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            New ready-to-dispatch blood requests will appear here automatically.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 py-4">
      {sortedRequests.map((request) => (
        <DeliveryRequestCard
          key={getDeliveryRequestId(request)}
          request={request}
          onAccepted={handleRequestAccepted}
          onDeclined={handleRequestDeclined}
        />
      ))}
    </section>
  );
};