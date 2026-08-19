import { useEffect, useState } from "react";
import { AlertCircle, BadgeCheck, Building2, LoaderCircle, MapPin, Phone } from "lucide-react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { getPublicHospitalById } from "../api/hospitalApi.js";

const formatLabel = (value) =>
  String(value || "Hospital")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const HospitalPublicDashboard = () => {
  const { hospitalId } = useParams();
  const { setHeaderContent } = useOutletContext();
  const [hospital, setHospital] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Hospital Details",
      subtitle: "View verified hospital information and contact details.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPublicHospitalById(hospitalId);
        setHospital(response?.hospital || null);
      } catch (err) {
        setError(err.message || "Unable to load hospital details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospital();
  }, [hospitalId]);

  if (isLoading) {
    return (
      <div className="px-2 py-3 sm:px-4">
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-emerald-600" />
          Loading hospital...
        </div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="px-2 py-3 sm:px-4">
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <AlertCircle className="mr-2 inline size-4" />
          {error || "Hospital not found."}
        </div>
      </div>
    );
  }

  const address = hospital.address?.fullAddress || "Address not available";
  const phone = hospital.phoneNumber || hospital.contactPerson?.phoneNumber || "Phone not available";

  return (
    <div className="px-2 py-3 sm:px-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <Link to="/nearby-hospitals" className="text-xs font-extrabold text-slate-500 transition hover:text-emerald-700">
          Back to nearby hospitals
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
              Verified Hospital
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold leading-7 text-slate-950">{hospital.name}</h1>
              <BadgeCheck className="size-5 fill-emerald-500 text-white" />
            </div>
            <p className="mt-1 text-sm font-bold text-slate-500">{formatLabel(hospital.hospitalType)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <Building2 className="size-4 text-emerald-600" />
            <p className="mt-2 text-[11px] font-extrabold uppercase text-slate-400">Hospital Type</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">{formatLabel(hospital.hospitalType)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <Phone className="size-4 text-emerald-600" />
            <p className="mt-2 text-[11px] font-extrabold uppercase text-slate-400">Phone</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">{phone}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <MapPin className="size-4 text-emerald-600" />
            <p className="mt-2 text-[11px] font-extrabold uppercase text-slate-400">Location</p>
            <p className="mt-1 line-clamp-2 text-sm font-extrabold text-slate-900">{address}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-sm font-extrabold text-slate-950">Address</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{address}</p>
        </div>
      </section>
    </div>
  );
};
