import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import {AlertCircle,ArrowLeft,Ban,Bike,CalendarDays,CheckCircle2,ClipboardCheck,ExternalLink,FileCheck2,FileText,LoaderCircle,MapPin,RotateCcw,ShieldCheck,UserRound,XCircle} from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getDeliveryPartnerById, updateDeliveryPartnerStatus } from "../../api/deliveryPartnerApi";
import { formatDateOnly, formatTicketDate } from "../../utils/dateCustomization";
import "leaflet/dist/leaflet.css";

const statusClass = {
  pending: "bg-orange-50 text-orange-700 ring-orange-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  suspended: "bg-slate-100 text-slate-700 ring-slate-200",
};

const availabilityClass = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  busy: "bg-rose-50 text-rose-700 ring-rose-200",
  offline: "bg-slate-100 text-slate-600 ring-slate-200",
};

const mapIcon = L.divIcon({
  className: "",
  html: '<div class="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-rose-600 text-white shadow-lg shadow-rose-200"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const formatLabel = (value) => {
  if (!value) return "Not available";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getCoordinates = (partner) => {
  const coordinates = partner?.currentLocation?.coordinates || [];
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return { latitude, longitude };
};

const normalizePartner = (partner) => {
  if (!partner) return null;

  return {
    id: partner._id,
    name: partner.fullName || "Unnamed partner",
    email: partner.email || "Not available",
    phone: partner.phoneNumber || "Not available",
    aadhaarNumber: partner.aadhaarNumber || "Not available",
    aadhaarDocumentUrl: partner.aadhaarDocumentUrl || "",
    identityVerificationStatus: partner.identityVerificationStatus || "pending",
    vehicleType: partner.vehicleType || "Not available",
    vehicleNumber: partner.vehicleNumber || "Not available",
    drivingLicenseNumber: partner.drivingLicenseNumber || "Not available",
    drivingLicenseDocumentUrl: partner.drivingLicenseDocumentUrl || "",
    accountStatus: partner.accountStatus || "pending",
    availabilityStatus: partner.availabilityStatus || "offline",
    coordinates: getCoordinates(partner),
    locationUpdatedAt: partner.locationUpdatedAt,
    createdAt: partner.createdAt,
    updatedAt: partner.updatedAt,
    registeredOn: formatDateOnly(partner.createdAt, "Not available"),
  };
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${statusClass[status] || statusClass.pending}`}>
      {status === "pending" ? "Pending Verification" : formatLabel(status)}
    </span>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
        {Icon ? <Icon className="size-4 text-[#D90429]" /> : null}
        {title}
      </h2>
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
    success: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
  };

  return (
    <button
      type="button"
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]}`}
      {...props}
    >
      {children}
    </button>
  );
}

function DocumentsSection({ partner }) {
  const documents = [
    {
      name: "Aadhaar Document",
      number: partner.aadhaarNumber,
      url: partner.aadhaarDocumentUrl,
    },
    {
      name: "Driving License",
      number: partner.drivingLicenseNumber,
      url: partner.drivingLicenseDocumentUrl,
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
                <p className="truncate text-sm font-extrabold text-slate-900">{document.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Number: {document.number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
                {document.url ? "Submitted" : "Not submitted"}
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

function PartnerSummary({ partner }) {
  return (
    <SectionCard title="Partner Summary" icon={UserRound}>
      <InfoGrid
        className="lg:grid-cols-4"
        items={[
          { label: "Email", value: partner.email },
          { label: "Phone Number", value: partner.phone },
          { label: "Registration Date", value: partner.registeredOn },
          { label: "Identity Verification", value: formatLabel(partner.identityVerificationStatus) },
        ]}
      />
    </SectionCard>
  );
}

function StatusPanel({ partner, onAction, isUpdating, verificationChecks, onVerificationCheckChange }) {
  if (partner.accountStatus === "approved") {
    return (
      <SectionCard title="Approved Verification" icon={ShieldCheck}>
        <InfoGrid
          items={[
            { label: "Verified status", value: "Approved and active" },
            { label: "Availability", value: formatLabel(partner.availabilityStatus) },
            { label: "Identity verification", value: formatLabel(partner.identityVerificationStatus) },
            { label: "Latest activity", value: formatTicketDate(partner.updatedAt, "Not available") },
          ]}
        />
        <div className="mt-4">
          <DetailButton tone="danger" disabled={isUpdating} onClick={() => onAction("suspended")}>
            <Ban className="size-4" />
            Suspend Partner
          </DetailButton>
        </div>
      </SectionCard>
    );
  }

  if (partner.accountStatus === "suspended") {
    return (
      <SectionCard title="Suspension Details" icon={Ban}>
        <InfoGrid
          items={[
            { label: "Current status", value: "Suspended" },
            { label: "Last updated", value: formatTicketDate(partner.updatedAt, "Not available") },
            { label: "Registration date", value: partner.registeredOn },
          ]}
        />
        <div className="mt-4">
          <DetailButton tone="success" disabled={isUpdating} onClick={() => onAction("approved")}>
            <RotateCcw className="size-4" />
            Reactivate Partner
          </DetailButton>
        </div>
      </SectionCard>
    );
  }

  if (partner.accountStatus === "rejected") {
    return (
      <SectionCard title="Rejection Review" icon={XCircle}>
        <InfoGrid
          items={[
            { label: "Current status", value: "Rejected" },
            { label: "Identity verification", value: formatLabel(partner.identityVerificationStatus) },
            { label: "Last updated", value: formatTicketDate(partner.updatedAt, "Not available") },
            { label: "Application status", value: "Rejected" },
          ]}
        />
        <div className="mt-4">
          <DetailButton disabled={isUpdating} onClick={() => onAction("pending")}>
            <RotateCcw className="size-4" />
            Review / Reconsider
          </DetailButton>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Verification Checklist" icon={ClipboardCheck}>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { key: "identityDocumentReviewed", label: "Identity document reviewed" },
          { key: "drivingLicenseReviewed", label: "Driving license reviewed" },
          { key: "vehicleInformationVerified", label: "Vehicle information verified" },
          { key: "locationVerified", label: "Location verified" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={verificationChecks[item.key]}
              onChange={(event) => onVerificationCheckChange(item.key, event.target.checked)}
              className="size-4 accent-[#D90429]"
            />
            {item.label}
          </label>
        ))}
      </div>
      {!Object.values(verificationChecks).every(Boolean) ? (
        <p className="mt-3 text-xs font-bold text-amber-700">
          Complete all checklist items before approving this partner.
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <DetailButton tone="danger" disabled={isUpdating} onClick={() => onAction("rejected")}>
          <XCircle className="size-4" />
          Reject Application
        </DetailButton>
        <DetailButton tone="success" disabled={isUpdating || !Object.values(verificationChecks).every(Boolean)} onClick={() => onAction("approved")}>
          <CheckCircle2 className="size-4" />
          Approve Partner
        </DetailButton>
      </div>
    </SectionCard>
  );
}

export const DeliveryPartnetDetails = () => {
  const { partnerId } = useParams();
  const { setHeaderContent } = useOutletContext();
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [verificationChecks, setVerificationChecks] = useState({
    identityDocumentReviewed: false,
    drivingLicenseReviewed: false,
    vehicleInformationVerified: false,
    locationVerified: false,
  });

  useEffect(() => {
    setHeaderContent({
      title: "Delivery Partner Details",
      subtitle: "Review registration, verification, and delivery partner information.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getDeliveryPartnerById(partnerId);
        setPartnerDetails(normalizePartner(response?.partner));
      } catch (err) {
        setError(err.message || "Unable to load delivery partner details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartner();
  }, [partnerId]);

  const coordinates = useMemo(() => partnerDetails?.coordinates, [partnerDetails?.coordinates]);

  const handleVerificationCheckChange = (key, isChecked) => {
    setVerificationChecks((current) => ({
      ...current,
      [key]: isChecked,
    }));
  };

  const handleStatusAction = async (accountStatus) => {
    try {
      setIsUpdating(true);
      setError("");
      const response = await updateDeliveryPartnerStatus(partnerId, accountStatus);
      setPartnerDetails(normalizePartner(response?.partner));
    } catch (err) {
      setError(err.message || "Unable to update delivery partner status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-2 py-2 sm:px-4 lg:px-5">
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-[#D90429]" />
          Loading delivery partner details...
        </div>
      </div>
    );
  }

  if (error && !partnerDetails) {
    return (
      <div className="px-2 py-2 sm:px-4 lg:px-5">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-bold text-red-600">
          <AlertCircle className="mr-2 inline size-4" />
          {error}
        </div>
      </div>
    );
  }

  const partner = partnerDetails;
  const showAvailabilityBadge = partner.accountStatus === "approved";

  return (
    <div className="px-2 py-2 sm:px-4 lg:px-5">
      <div className="w-full space-y-3">
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
             
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-normal text-slate-950">{partner.name}</h1>
                <StatusBadge status={partner.accountStatus} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-slate-500">
                
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  Registered: {partner.registeredOn}
                </span>
              </div>
            </div>
            {showAvailabilityBadge ? (
              <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${availabilityClass[partner.availabilityStatus] || availabilityClass.offline}`}>
                {formatLabel(partner.availabilityStatus)}
              </span>
            ) : null}
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            <AlertCircle className="mr-2 inline size-4" />
            {error}
          </div>
        ) : null}

        <PartnerSummary partner={partner} />

        <SectionCard title="Vehicle Information" icon={Bike}>
          <InfoGrid
            className="lg:grid-cols-3"
            items={[
              { label: "Vehicle Type", value: formatLabel(partner.vehicleType) },
              { label: "Vehicle Number", value: partner.vehicleNumber },
              { label: "Driving License Number", value: partner.drivingLicenseNumber },
            ]}
          />
        </SectionCard>

        <SectionCard title="Current Location" icon={MapPin}>
          <div className="grid gap-3 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
            <InfoGrid
              className="lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3"
              items={[
                { label: "Latitude", value: coordinates?.latitude?.toFixed(6) },
                { label: "Longitude", value: coordinates?.longitude?.toFixed(6) },
                { label: "Location Updated", value: formatTicketDate(partner.locationUpdatedAt, "Not available") },
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

        <DocumentsSection partner={partner} />
        <StatusPanel
          partner={partner}
          onAction={handleStatusAction}
          isUpdating={isUpdating}
          verificationChecks={verificationChecks}
          onVerificationCheckChange={handleVerificationCheckChange}
        />
      </div>
    </div>
  );
};
