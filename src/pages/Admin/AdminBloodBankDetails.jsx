import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import {AlertCircle,ArrowLeft,Ban,Building2,CalendarDays,CheckCircle2,ClipboardCheck,Droplet,ExternalLink,FileCheck2,FileText,History,LoaderCircle,Mail,MapPin,Phone,RotateCcw,ShieldCheck,UserRound,X,XCircle} from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {fetchParticularBloodBank,updateAdminBloodBankStatus} from "../../api/bloodBankApi";
import { formatDateOnly, formatTicketDate } from "../../utils/dateCustomization";
import "leaflet/dist/leaflet.css";

const statusClass = {
  Pending: "bg-orange-50 text-orange-700 ring-orange-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  Suspended: "bg-slate-100 text-slate-700 ring-slate-200",
};

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const inventoryTypes = ["PRBC", "Platelets", "Plasma"];

const mapIcon = L.divIcon({
  className: "",
  html: '<div class="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-rose-600 text-white shadow-lg shadow-rose-200"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const getApplicationId = (id, createdAt) => {
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
  return `BB-${year}-${String(id || "").slice(-6).toUpperCase()}`;
};

const getCoordinates = (bloodBank) => {
  const coordinates = bloodBank?.location?.coordinates || [];
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  return { latitude, longitude };
};

const getUserName = (user) => user?.username || user?.email || "Admin";

const normalizeBloodBank = (bloodBank) => {
  if (!bloodBank) return null;

  const coordinates = getCoordinates(bloodBank);
  const user = bloodBank.userId || {};

  return {
    id: bloodBank._id,
    applicationId: getApplicationId(bloodBank._id, bloodBank.createdAt),
    name: bloodBank.bloodBankName || "Unnamed blood bank",
    type: "Registered blood bank",
    status: bloodBank.status || "Pending",
    email: user.email || "Not available",
    phone: bloodBank.phoneNumber || user.phoneNumber || "Not available",
    contactPerson: bloodBank.contactPersonName || user.username || "Not available",
    operatorRole: user.role || "BloodBank",
    operatorAccountStatus: bloodBank.status === "Suspended" ? "Suspended" : "Active",
    address: bloodBank.address || {},
    coordinates,
    createdAt: bloodBank.createdAt,
    updatedAt: bloodBank.updatedAt,
    registeredOn: formatDateOnly(bloodBank.createdAt, "Not available"),
    workingHours: bloodBank.workingHours || {},
    licenseNumber: bloodBank.licenseNumber || "Not available",
    licenseDocument: bloodBank.licenseDocument || {},
    inventory: bloodBank.inventory || [],
    review: bloodBank.review || {},
    activityHistory: bloodBank.activityHistory || [],
  };
};

const getInventoryUnits = (inventory, type, bloodGroup) => {
  const item = inventory.find((entry) => entry.type === type && entry.bloodGroup === bloodGroup);
  return String(Number(item?.unitsAvailable || 0)).padStart(2, "0");
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${statusClass[status] || statusClass.Pending}`}>
      {status === "Pending" ? "Pending Verification" : status}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
          {Icon ? <Icon className="size-4 text-[#D90429]" /> : null}
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoGrid({ items, className = "" }) {
  return (
    <dl className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="min-h-20 rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
          <dt className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">{item.label}</dt>
          <dd className="mt-1 text-sm font-bold leading-5 text-slate-800">{item.value || "Not available"}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailButton({ children, tone = "neutral", ...props }) {
  const tones = {
    neutral: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    primary: "border-[#D90429] bg-[#D90429] text-white hover:bg-red-700",
    success: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
  };

  return (
    <button
      type="button"
      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]}`}
      {...props}
    >
      {children}
    </button>
  );
}

function DocumentsSection({ bank }) {
  const documents = [
    {
      name: "Blood Bank License",
      url: bank.licenseDocument.url,
      status: bank.licenseDocument.isVerified ? "Verified" : bank.licenseDocument.url ? "Submitted" : "Not submitted",
    },
  ];

  return (
    <SectionCard title="Registration & Verification Documents" icon={FileCheck2}>
      <div className="space-y-2">
        {documents.map((document) => (
          <div key={document.name} className="flex flex-col gap-3 rounded-lg border border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#D90429]">
                <FileText className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-850">{document.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Uploaded: {document.url ? bank.registeredOn : "Not available"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
                {document.status}
              </span>
              {document.url ? (
                <a
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-[#D90429] hover:text-[#D90429]"
                >
                  View Document
                  <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function VerificationChecklist() {
  const checks = [
    "Blood bank information verified",
    "Operator information verified",
    "Address verified",
    "License verified",
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {checks.map((item) => (
        <label key={item} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700">
          <input type="checkbox" className="size-4 accent-[#D90429]" />
          {item}
        </label>
      ))}
    </div>
  );
}

function StatusPanel({ bank, onAction, isUpdating }) {
  const reviewer = bank.review.approvedBy || bank.review.rejectedBy || bank.review.suspendedBy;

  if (bank.status === "Approved") {
    return (
      <SectionCard title="Approved Verification" icon={ShieldCheck}>
        <InfoGrid
          items={[
            { label: "Verified status", value: "Approved and active" },
            { label: "Approved date", value: formatTicketDate(bank.review.approvedAt, "Not available") },
            { label: "Approved by", value: getUserName(bank.review.approvedBy) },
            { label: "Latest activity", value: formatTicketDate(bank.updatedAt, "Not available") },
          ]}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <DetailButton disabled>Edit Details</DetailButton>
          <DetailButton tone="danger" disabled={isUpdating} onClick={() => onAction("Suspended")}>
            <Ban className="size-4" />
            Suspend Blood Bank
          </DetailButton>
        </div>
      </SectionCard>
    );
  }

  if (bank.status === "Suspended") {
    return (
      <SectionCard title="Suspension Details" icon={Ban}>
        <InfoGrid
          items={[
            { label: "Suspension date", value: formatTicketDate(bank.review.suspendedAt, "Not available") },
            { label: "Suspension reason", value: bank.review.suspensionReason || "Not available" },
            { label: "Previous status", value: bank.review.previousStatus || "Not available" },
            { label: "Suspended by", value: getUserName(bank.review.suspendedBy) },
          ]}
        />
        <div className="mt-4">
          <DetailButton tone="success" disabled={isUpdating} onClick={() => onAction("Pending")}>
            <RotateCcw className="size-4" />
            Reactivate Blood Bank
          </DetailButton>
        </div>
      </SectionCard>
    );
  }

  if (bank.status === "Rejected") {
    return (
      <SectionCard title="Rejection Review" icon={XCircle}>
        <InfoGrid
          items={[
            { label: "Rejection date", value: formatTicketDate(bank.review.rejectedAt, "Not available") },
            { label: "Rejection reason", value: bank.review.rejectionReason || "Not available" },
            { label: "Reviewer", value: getUserName(bank.review.rejectedBy || reviewer) },
            { label: "Application status", value: "Rejected" },
          ]}
        />
        <div className="mt-4">
          <DetailButton disabled={isUpdating} onClick={() => onAction("Pending")}>
            <RotateCcw className="size-4" />
            Review / Reconsider
          </DetailButton>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Verification Checklist" icon={ClipboardCheck}>
      <VerificationChecklist />
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <DetailButton tone="danger" disabled={isUpdating} onClick={() => onAction("Rejected")}>
          <XCircle className="size-4" />
          Reject Application
        </DetailButton>
        <DetailButton tone="success" disabled={isUpdating} onClick={() => onAction("Approved")}>
          <CheckCircle2 className="size-4" />
          Approve Blood Bank
        </DetailButton>
      </div>
    </SectionCard>
  );
}



function ReasonModal({ action, onClose, onConfirm, isUpdating }) {
  const [reason, setReason] = useState("");
  const title = action === "Rejected" ? "Reject Application" : "Suspend Blood Bank";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Enter a clear reason for the admin record.</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close modal">
            <X className="size-4" />
          </button>
        </div>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={5}
          className="mt-4 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-[#D90429] focus:ring-4 focus:ring-red-100"
          placeholder="Write the reason..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <DetailButton onClick={onClose}>Cancel</DetailButton>
          <DetailButton tone="danger" disabled={!reason.trim() || isUpdating} onClick={() => onConfirm(action, reason)}>
            Confirm
          </DetailButton>
        </div>
      </div>
    </div>
  );
}

function InventoryModal({ bank, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-5 backdrop-blur-sm">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-extrabold text-slate-950">
              <Droplet className="size-4 text-[#D90429]" />
              Blood Availability
            </h2>
            <p className="mt-0.5 text-xs font-bold text-slate-500">{bank.name}</p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close inventory modal">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto bg-slate-50 p-3.5">
          <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Blood Availability</p>
            <div className="mt-3 space-y-3.5">
              {inventoryTypes.map((type) => (
                <div key={type}>
                  <h3 className="text-xs font-extrabold text-slate-600">{type}</h3>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {bloodGroups.map((bloodGroup) => (
                      <div key={`${type}-${bloodGroup}`} className="flex h-8 items-center justify-between rounded-md bg-white px-2 text-xs font-extrabold shadow-sm shadow-slate-200/40">
                        <span className="text-slate-500">{bloodGroup}</span>
                        <span className="text-slate-950">{getInventoryUnits(bank.inventory, type, bloodGroup)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const BloodBankDetails = () => {
  const { bloodBankId } = useParams();
  const { setHeaderContent } = useOutletContext();
  const [bloodBankDetails, setBloodBankDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [modalAction, setModalAction] = useState("");
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  useEffect(() => {
    setHeaderContent({
      title: "Blood Bank Details",
      subtitle: "Review registration, verification, and blood bank information.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchBloodBank = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetchParticularBloodBank(bloodBankId);
        setBloodBankDetails(normalizeBloodBank(response?.bloodBank));
      } catch (err) {
        setError(err.message || "Unable to load blood bank details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBloodBank();
  }, [bloodBankId]);

  const coordinates = useMemo(() => bloodBankDetails?.coordinates, [bloodBankDetails?.coordinates]);

  const handleStatusAction = async (status, reason = "") => {
    if (status === "Rejected" || status === "Suspended") {
      if (!reason) {
        setModalAction(status);
        return;
      }
    }

    try {
      setIsUpdating(true);
      setError("");
      const response = await updateAdminBloodBankStatus(bloodBankId, status, reason);
      setBloodBankDetails(normalizeBloodBank(response?.bloodBank));
      setModalAction("");
    } catch (err) {
      setError(err.message || "Unable to update blood bank status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-2 py-2 sm:px-4 lg:px-5">
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-[#D90429]" />
          Loading blood bank details...
        </div>
      </div>
    );
  }

  if (error && !bloodBankDetails) {
    return (
      <div className="px-2 py-2 sm:px-4 lg:px-5">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-600">
          <AlertCircle className="mr-2 inline size-4" />
          {error}
        </div>
      </div>
    );
  }

  const bank = bloodBankDetails;

  return (
    <div className="px-2 py-2 sm:px-4 lg:px-5">
      <div className="w-full space-y-3">
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-normal text-slate-950">{bank.name}</h1>
                <StatusBadge status={bank.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-slate-500">
                <span>{bank.applicationId}</span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  Registered: {bank.registeredOn}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInventoryModal(true)}
              className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-red-100 bg-red-50 px-3 text-[11px] font-extrabold text-[#D90429] transition hover:border-[#D90429] hover:bg-white"
            >
              <Droplet className="size-3.5" />
              View Inventory
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            <AlertCircle className="mr-2 inline size-4" />
            {error}
          </div>
        ) : null}

        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_520px] 2xl:grid-cols-[minmax(0,1fr)_580px]">
          <div>
            <SectionCard title="Blood Bank Information" icon={Building2}>
              <InfoGrid
                className="2xl:grid-cols-3"
                items={[
                  { label: "Blood Bank Name", value: bank.name },
                  { label: "Registration ID", value: bank.applicationId },
                  { label: "Blood Bank Type", value: bank.type },
                  { label: "Email", value: bank.email },
                  { label: "Phone Number", value: bank.phone },
                  { label: "Registration Date", value: bank.registeredOn },
                  { label: "Operating Status", value: bank.status },
                ]}
              />
            </SectionCard>
          </div>

          <aside className="space-y-3">
            <SectionCard
              title="Blood Bank Operator"
              icon={UserRound}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-extrabold text-[#D90429]">
                  {bank.contactPerson.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-950">{bank.contactPerson}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{bank.operatorRole}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="size-4 shrink-0 text-slate-400" />
                  <span className="break-all">{bank.email}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <Phone className="size-4 shrink-0 text-slate-400" />
                  <span className="truncate">{bank.phone}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-slate-400" />
                  <span className="truncate">{bank.operatorAccountStatus}</span>
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Application Summary" icon={ClipboardCheck}>
              <InfoGrid
                items={[
                  { label: "License Number", value: bank.licenseNumber },
                  { label: "Last Updated", value: formatTicketDate(bank.updatedAt, "Not available") },
                ]}
              />
            </SectionCard>
          </aside>
        </div>

        <SectionCard title="Location" icon={MapPin}>
          <div className="grid gap-3 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
            <InfoGrid
              className="lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3"
              items={[
                { label: "Complete Address", value: bank.address.completeAddress },
                { label: "City", value: bank.address.city },
                { label: "District", value: bank.address.district },
                { label: "State", value: bank.address.state },
                { label: "Latitude", value: coordinates?.latitude?.toFixed(6) },
                { label: "Longitude", value: coordinates?.longitude?.toFixed(6) },
              ]}
            />
            <div className="h-72 min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 2xl:h-80">
              {coordinates ? (
                <MapContainer center={[coordinates.latitude, coordinates.longitude]} zoom={14} scrollWheelZoom={false} className="h-full w-full">
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker icon={mapIcon} position={[coordinates.latitude, coordinates.longitude]} />
                </MapContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-bold text-slate-500">Location coordinates unavailable.</div>
              )}
            </div>
          </div>
        </SectionCard>

        <DocumentsSection bank={bank} />
        <StatusPanel bank={bank} onAction={handleStatusAction} isUpdating={isUpdating} />
      </div>

      {modalAction ? (
        <ReasonModal
          action={modalAction}
          isUpdating={isUpdating}
          onClose={() => setModalAction("")}
          onConfirm={handleStatusAction}
        />
      ) : null}
      {showInventoryModal ? <InventoryModal bank={bank} onClose={() => setShowInventoryModal(false)} /> : null}
    </div>
  );
};
