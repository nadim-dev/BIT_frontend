import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, Clock3, Droplet, LoaderCircle, MapPin, Phone } from "lucide-react";
import { useOutletContext, useParams } from "react-router-dom";
import { getPublicBloodBank } from "../api/bloodBankApi.js";
import defaultBloodBankImage from "../assets/deafult_bank_image.png";

const formatAddress = (address = {}) => {
  return [address.completeAddress, address.city, address.district, address.state]
    .filter(Boolean)
    .join(", ");
};

const formatWorkingHours = (workingHours = {}) => {
  if (workingHours.isOpen24Hours) return "Open 24 hours";
  return `${workingHours.openingTime || "--"} - ${workingHours.closingTime || "--"}`;
};

export const BloodBankPublicDashboard = () => {
  const { bloodBankId } = useParams();
  const { setHeaderContent } = useOutletContext();
  const [bloodBank, setBloodBank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    </div>
  );
};
