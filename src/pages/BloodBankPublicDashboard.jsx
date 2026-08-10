import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, Clock3, Droplet, LoaderCircle, MapPin, Minus, Phone, Plus, Send, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { createBloodRequest, getPublicBloodBank } from "../api/bloodBankApi.js";
import bloodLogo from "../assets/blood_logo.png";
import defaultBloodBankImage from "../assets/deafult_bank_image.png";

const BLOOD_COMPONENTS = ["Red Blood Cell", "Platelets", "Plasma"];
const formatAddress = (address = {}) => {
  return [address.completeAddress, address.city, address.district, address.state]
    .filter(Boolean)
    .join(", ");
};

const formatWorkingHours = (workingHours = {}) => {
  if (workingHours.isOpen24Hours) return "Open 24 hours";
  return `${workingHours.openingTime || "--"} - ${workingHours.closingTime || "--"}`;
};

const normalizeInventory = (inventory = []) =>
  inventory.map((item) => ({
    component: item.type || item.component || "PRBC",
    bloodGroup: item.bloodGroup,
    processingFee: Number(item.processingFee || 0),
    unitsAvailable: Number(item.unitsAvailable || 0),
  }));

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const BloodLogoMark = ({ className = "size-5" }) => (
  <img src={bloodLogo} alt="" className={`${className} object-contain`} aria-hidden="true" />
);

export const BloodBankPublicDashboard = () => {
  const { bloodBankId } = useParams();
  const { setHeaderContent } = useOutletContext();
  const [bloodBank, setBloodBank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [draftItems, setDraftItems] = useState({});
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    contactNumber: "",
    alternateContactNumber: "",
  });
  const [isRecipientFormOpen, setIsRecipientFormOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState("PRBC");
  const getItemKey = (component, bloodGroup) => `${component}:${bloodGroup}`;

  useEffect(() => {
    setHeaderContent({
      title: "Blood Bank Dashboard",
      subtitle: "View blood availability and continue your online request.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchBloodBank = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPublicBloodBank(bloodBankId);
        setBloodBank(response?.bloodBank || null);
      } catch (err) {
        setError(err.message || "Unable to load blood bank details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBloodBank();
  }, [bloodBankId]);

  const bankImageUrl = bloodBank?.imageUrl || bloodBank?.imageURL || "";
  const hasBankImage = Boolean(bankImageUrl);
  const displayImage = bankImageUrl || defaultBloodBankImage;
  const address = useMemo(() => formatAddress(bloodBank?.address), [bloodBank?.address]);
  const inventory = useMemo(() => normalizeInventory(bloodBank?.inventory), [bloodBank?.inventory]);
  const inventoryByKey = useMemo(
    () =>
      inventory.reduce((items, item) => {
        items[getItemKey(item.component, item.bloodGroup)] = item;
        return items;
      }, {}),
    [inventory],
  );
  const visibleInventory = useMemo(
    () => inventory.filter((item) => item.component === selectedComponent),
    [inventory, selectedComponent],
  );
  const draftEntries = useMemo(
    () =>
      Object.entries(draftItems).map(([itemKey, quantity]) => {
        const [component, bloodGroup] = itemKey.split(":");
        return {
          itemKey,
          component,
          bloodGroup,
          quantity,
        };
      }),
    [draftItems],
  );
  const visibleUnitCount = useMemo(
    () => visibleInventory.reduce((total, item) => total + item.unitsAvailable, 0),
    [visibleInventory],
  );
  const componentTotals = useMemo(
    () =>
      BLOOD_COMPONENTS.reduce((totals, component) => {
        totals[component] = inventory
          .filter((item) => item.component === component)
          .reduce((total, item) => total + item.unitsAvailable, 0);
        return totals;
      }, {}),
    [inventory],
  );
  const selectedUnitCount = useMemo(
    () => draftEntries.reduce((total, item) => total + item.quantity, 0),
    [draftEntries],
  );
  const selectedProcessingTotal = useMemo(
    () =>
      draftEntries.reduce((total, item) => {
        return total + Number(inventoryByKey[item.itemKey]?.processingFee || 0) * item.quantity;
      }, 0),
    [draftEntries, inventoryByKey],
  );

  const updateQuantity = (itemKey, nextQuantity, maxQuantity) => {
    const safeQuantity = Math.min(Math.max(Number(nextQuantity) || 1, 1), maxQuantity || 1);
    setSelectedQuantities((currentQuantities) => ({
      ...currentQuantities,
      [itemKey]: safeQuantity,
    }));
  };

  const addDraftItem = (component, bloodGroup, unitsAvailable) => {
    const itemKey = getItemKey(component, bloodGroup);
    const quantity = selectedQuantities[itemKey] || 1;
    updateQuantity(itemKey, quantity, unitsAvailable);
    setDraftItems((currentItems) => ({
      ...currentItems,
      [itemKey]: Math.min(quantity, unitsAvailable),
    }));
    setToast({ type: "success", message: `${bloodGroup} ${component} added to request.` });
  };

  const removeDraftItem = (itemKey) => {
    setDraftItems((currentItems) => {
      const nextItems = { ...currentItems };
      delete nextItems[itemKey];
      return nextItems;
    });
  };

  const updatePatientDetails = (field, value) => {
    setPatientDetails((currentDetails) => ({
      ...currentDetails,
      [field]: value,
    }));
  };

  const handleContinueRequest = async () => {
    if (!draftEntries.length) {
      setToast({ type: "error", message: "Please add at least one blood group before continuing." });
      return;
    }

    setToast(null);
    setSelectedQuantities({});
    setIsRecipientFormOpen(true);
  };

  const handleSubmitRequest = async () => {
    const items = draftEntries.map(({ component, bloodGroup, quantity }) => ({
      component,
      bloodGroup,
      quantity,
    }));

    if (!items.length) {
      setToast({ type: "error", message: "Please add at least one blood group before continuing." });
      return;
    }

    if (!patientDetails.name.trim() || !patientDetails.contactNumber.trim()) {
      setToast({ type: "error", message: "Please enter patient name and contact number before continuing." });
      return;
    }

    try {
      setIsSubmittingRequest(true);
      setToast(null);
      const response = await createBloodRequest(bloodBankId, {
        items,
        patient: patientDetails,
      });
      setToast({
        type: "success",
        message: response?.message || "Blood request submitted successfully.",
        actionLabel: "Track Request",
        actionHref: "/my-requests",
      });
      setDraftItems({});
      setPatientDetails({
        name: "",
        contactNumber: "",
        alternateContactNumber: "",
      });
      setIsRecipientFormOpen(false);
    } catch (err) {
      setToast({ type: "error", message: err.message || "Unable to submit blood request." });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-2 py-3 sm:px-4">
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-[#D90429]" />
          Loading blood bank...
        </div>
      </div>
    );
  }

  if (error || !bloodBank) {
    return (
      <div className="px-2 py-3 sm:px-4">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <AlertCircle className="mr-2 inline size-4" />
          {error || "Blood bank not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-3 sm:px-4">
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <div className={`grid gap-4 ${hasBankImage ? "lg:grid-cols-[1fr_190px]" : ""}`}>
          <div className="flex min-w-0 gap-4">
            <img
              src={displayImage}
              alt={bloodBank.bloodBankName}
              className="h-28 w-28 shrink-0 rounded-lg object-cover ring-1 ring-slate-100"
            />

            <div className="min-w-0 py-1">
              <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#D90429]">
                Selected Blood Bank
              </span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold leading-6 text-slate-950">{bloodBank.bloodBankName}</h2>
                <BadgeCheck className="size-5 fill-emerald-500 text-white" />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                <span className="inline-flex max-w-xl items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{address || "Address not available"}</span>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400" />
                  {bloodBank.phoneNumber || "Phone not available"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-slate-400" />
                  {formatWorkingHours(bloodBank.workingHours)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">Open Now</span>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-sky-700">Verified</span>
              </div>
            </div>
          </div>

          {hasBankImage ? (
            <aside className="hidden rounded-lg bg-red-50 p-4 lg:flex lg:flex-col lg:justify-center">
              <span className="grid size-11 place-items-center rounded-full bg-white text-[#D90429] shadow-sm">
                <Droplet className="size-5 fill-[#D90429]" />
              </span>
              <p className="mt-4 text-xs font-extrabold leading-5 text-slate-800">
                Never run out of hope.
                <br />
                Donate blood, save lives.
              </p>
            </aside>
          ) : null}
        </div>
      </section>

      

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <BloodLogoMark className="size-11" />
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Blood Inventory</h3>
              <p className="text-xs font-semibold text-slate-500">Select quantity and request available blood units.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-extrabold text-[#D90429]">
            <BloodLogoMark className="size-5" />
            {visibleUnitCount} {selectedComponent} units available
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {BLOOD_COMPONENTS.map((component) => (
            <button
              key={component}
              type="button"
              className={`inline-flex h-9 items-center rounded-md border px-3 text-xs font-extrabold transition ${
                selectedComponent === component
                  ? "border-[#D90429] bg-red-50 text-[#D90429]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-red-100 hover:bg-red-50"
              }`}
              onClick={() => setSelectedComponent(component)}
            >
              {component}
              <span className="ml-2 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-500">
                {componentTotals[component] || 0}
              </span>
            </button>
          ))}
        </div>

        {toast ? (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-xs font-bold ${
              toast.type === "success"
                ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border border-red-100 bg-red-50 text-red-600"
            }`}
          >
            <span>{toast.message}</span>
            {toast.actionHref ? (
              <Link to={toast.actionHref} className="ml-2 underline underline-offset-2">
                {toast.actionLabel}
              </Link>
            ) : null}
          </div>
        ) : null}

        {visibleInventory.length ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_300px]">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {visibleInventory.map(({ component, bloodGroup, processingFee, unitsAvailable }) => {
                const isAvailable = unitsAvailable > 0;
                const itemKey = getItemKey(component, bloodGroup);
                const quantity = selectedQuantities[itemKey] || 1;
                const draftedQuantity = draftItems[itemKey];

                return (
                  <article
                    key={itemKey}
                    className="flex min-h-40 flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 transition hover:border-red-100 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <BloodLogoMark className="size-12" />
                          <span className="text-xl font-black text-[#D90429]">{bloodGroup}</span>
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 text-[9px] font-extrabold uppercase ${
                            isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isAvailable ? "In stock" : "Unavailable"}
                        </span>
                      </div>
                      <p className="mt-4 text-xs font-bold text-slate-500">
                        <span className="text-base font-black text-[#D90429]">{unitsAvailable}</span> unit{unitsAvailable === 1 ? "" : "s"} available
                        <span className="ml-1 text-slate-400">({component})</span>
                      </p>
                      <p className="mt-1 text-xs font-extrabold text-slate-700">
                        {formatCurrency(processingFee)} processing charge
                      </p>
                      {draftedQuantity ? (
                        <p className="mt-2 text-xs font-extrabold text-emerald-700">{draftedQuantity} unit{draftedQuantity === 1 ? "" : "s"} in request</p>
                      ) : null}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex h-9 items-center overflow-hidden rounded-md border border-slate-200 bg-white">
                        <button
                          type="button"
                          className="grid h-9 flex-1 place-items-center text-slate-600 disabled:text-slate-300"
                          disabled={!isAvailable || quantity <= 1 || isSubmittingRequest}
                          onClick={() => updateQuantity(itemKey, quantity - 1, unitsAvailable)}
                          aria-label={`Decrease ${bloodGroup} ${component} units`}
                        >
                          <Minus className="size-4" />
                        </button>
                        <input
                          className="h-9 w-16 border-x border-slate-200 text-center text-sm font-extrabold text-slate-950 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                          type="number"
                          min="1"
                          max={unitsAvailable || 1}
                          value={quantity}
                          disabled={!isAvailable || isSubmittingRequest}
                          onChange={(event) => updateQuantity(itemKey, event.target.value, unitsAvailable)}
                          aria-label={`${bloodGroup} ${component} units`}
                        />
                        <button
                          type="button"
                          className="grid h-9 flex-1 place-items-center text-slate-600 disabled:text-slate-300"
                          disabled={!isAvailable || quantity >= unitsAvailable || isSubmittingRequest}
                          onClick={() => updateQuantity(itemKey, quantity + 1, unitsAvailable)}
                          aria-label={`Increase ${bloodGroup} ${component} units`}
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-xs font-extrabold text-[#D90429] transition hover:border-[#D90429] hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                        disabled={!isAvailable || isSubmittingRequest}
                        onClick={() => addDraftItem(component, bloodGroup, unitsAvailable)}
                      >
                        <ShoppingCart className="size-3.5" />
                        {draftedQuantity ? "Update Request" : "Add to Request"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_16px_38px_rgba(15,23,42,0.08)] xl:sticky xl:top-4 xl:self-start">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-base font-extrabold text-slate-950">Your Request</h4>
                  <p className="text-xs font-bold text-slate-500">{draftEntries.length} item{draftEntries.length === 1 ? "" : "s"} selected</p>
                </div>
                <span className="grid size-10 place-items-center rounded-lg bg-red-50 text-[#D90429] ring-1 ring-red-100">
                  <ShoppingCart className="size-4" />
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {draftEntries.length ? (
                  draftEntries.map(({ itemKey, component, bloodGroup, quantity }) => (
                    <div key={itemKey} className="flex items-center justify-between gap-3 rounded-md bg-white px-2.5 py-2 ring-1 ring-slate-200">
                      <div className="flex items-center gap-2">
                        <BloodLogoMark className="size-8" />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{bloodGroup}</p>
                          <p className="text-[11px] font-bold text-slate-500">
                            {component} - {quantity} unit{quantity === 1 ? "" : "s"} - {formatCurrency((inventoryByKey[itemKey]?.processingFee || 0) * quantity)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="grid size-7 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-[#D90429]"
                        disabled={isSubmittingRequest}
                        onClick={() => removeDraftItem(itemKey)}
                        aria-label={`Remove ${bloodGroup} ${component} from request`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-6 text-center">
                    <ShoppingCart className="mx-auto size-5 text-slate-300" />
                    <p className="mt-2 text-xs font-bold text-slate-400">Add blood units to continue.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm font-extrabold text-slate-700">Total Units</span>
                <span className="text-sm font-black text-[#D90429]">{selectedUnitCount} unit{selectedUnitCount === 1 ? "" : "s"}</span>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-700">Processing Total</span>
                <span className="text-sm font-black text-slate-950">{formatCurrency(selectedProcessingTotal)}</span>
              </div>

              {isRecipientFormOpen ? (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <h5 className="text-sm font-extrabold text-slate-950">Recipient Details</h5>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">This helps the delivery partner contact the receiver.</p>
                  <div className="mt-3 grid gap-2">
                    <input
                      className="h-9 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D90429]"
                      type="text"
                      value={patientDetails.name}
                      onChange={(event) => updatePatientDetails("name", event.target.value)}
                      placeholder="Receiver name"
                      disabled={isSubmittingRequest}
                    />
                    <input
                      className="h-9 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D90429]"
                      type="tel"
                      value={patientDetails.contactNumber}
                      onChange={(event) => updatePatientDetails("contactNumber", event.target.value)}
                      placeholder="Phone number"
                      disabled={isSubmittingRequest}
                    />
                    <input
                      className="h-9 rounded-md border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D90429]"
                      type="tel"
                      value={patientDetails.alternateContactNumber}
                      onChange={(event) => updatePatientDetails("alternateContactNumber", event.target.value)}
                      placeholder="Alternate phone optional"
                      disabled={isSubmittingRequest}
                    />
                  </div>
                </div>
              ) : null}

              <div className="mt-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold leading-4 text-[#D90429]">
                Blood will be delivered to your registered address.
              </div>

              <button
                type="button"
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-[#D90429] px-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(217,4,41,0.22)] transition hover:bg-[#B70323] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                disabled={!draftEntries.length || isSubmittingRequest}
                onClick={isRecipientFormOpen ? handleSubmitRequest : handleContinueRequest}
              >
                {isSubmittingRequest ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                {isRecipientFormOpen ? "Submit Request" : "Continue Request"}
              </button>
            </aside>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm font-bold text-slate-500">
            {selectedComponent} inventory has not been added for this blood bank yet.
          </div>
        )}
      </section>
    </div>
  );
};
