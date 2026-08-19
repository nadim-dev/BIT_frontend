import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Building2, CheckCircle2, ChevronDown, Clock3, Eye, Hospital, LoaderCircle, Search, ShieldOff, XCircle } from "lucide-react";
import { getHospitalStats, getHospitals } from "../../api/hospitalApi";
import { formatDateOnly } from "../../utils/dateCustomization";
import getInitials from "../../utils/getInitial";

const statCards = [
  {
    key: "total",
    title: "Total",
    subtitle: "Registered hospitals",
    icon: Hospital,
    tone: "bg-red-50 text-[#D90429] ring-red-100",
    accent: "from-red-500/12",
  },
  {
    key: "pending",
    title: "Pending",
    subtitle: "Awaiting review",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
    accent: "from-amber-500/14",
  },
  {
    key: "approved",
    title: "Approved",
    subtitle: "Verified accounts",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    accent: "from-emerald-500/14",
  },
  {
    key: "suspended",
    title: "Suspended",
    subtitle: "Restricted accounts",
    icon: ShieldOff,
    tone: "bg-slate-100 text-slate-600 ring-slate-200",
    accent: "from-slate-500/12",
  },
];

const statusOptions = ["All", "pending", "approved", "rejected", "suspended"];
const hospitalTypeOptions = ["All", "government", "private", "trust", "multispecialty", "specialty", "other"];

const statusBadgeClass = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  suspended: "bg-slate-100 text-slate-700 ring-slate-200",
};

const formatLabel = (value) => {
  if (!value) return "Not available";

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const normalizeHospital = (hospital) => ({
  id: hospital._id,
  name: hospital.name || "Unnamed hospital",
  registrationNumber: hospital.registrationNumber || "Not available",
  hospitalType: hospital.hospitalType || "",
  accountStatus: hospital.accountStatus || "pending",
  verificationStatus: hospital.verificationStatus || "pending",
  contact: hospital.phoneNumber || hospital.contactPerson?.phoneNumber || "",
  email: hospital.email || hospital.contactPerson?.email || "",
  city: hospital.address?.city || "Not available",
  state: hospital.address?.state || "",
  joinedOn: formatDateOnly(hospital.createdAt, "Not available"),
});

function StatCard({ title, value, subtitle, icon: Icon, tone, accent }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.055)]">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} via-transparent to-transparent`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold leading-7 text-slate-950">{value}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{subtitle}</p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tone}`}>
          <Icon className="size-5" strokeWidth={2.25} />
        </span>
      </div>
    </article>
  );
}

export const AdminHospital = () => {
  const { setHeaderContent } = useOutletContext();
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [hospitalStats, setHospitalStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Hospitals",
      subtitle: "Manage registered hospitals and review their registration requests.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [statsResponse, hospitalsResponse] = await Promise.all([
          getHospitalStats(),
          getHospitals(),
        ]);

        setHospitalStats(statsResponse.stats);
        setHospitals((hospitalsResponse?.hospitals || []).map(normalizeHospital));
      } catch (err) {
        setError(err.message || "Unable to load hospital data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHospitalData();
  }, []);

  const cityOptions = useMemo(
    () => ["All", ...new Set(hospitals.map((hospital) => hospital.city).filter((city) => city && city !== "Not available"))],
    [hospitals],
  );

  const visibleHospitals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return hospitals.filter((hospital) => {
      const matchesSearch =
        !query ||
        [hospital.name, hospital.registrationNumber, hospital.contact, hospital.email, hospital.city]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "All" || hospital.accountStatus === statusFilter;
      const matchesType = typeFilter === "All" || hospital.hospitalType === typeFilter;
      const matchesCity = cityFilter === "All" || hospital.city === cityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCity;
    });
  }, [cityFilter, hospitals, searchTerm, statusFilter, typeFilter]);

  const hospitalsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(visibleHospitals.length / hospitalsPerPage));
  const paginatedHospitals = visibleHospitals.slice(
    (currentPage - 1) * hospitalsPerPage,
    currentPage * hospitalsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [cityFilter, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <section className="min-h-[calc(100vh-120px)] bg-[#F8FAFC] px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => (
            <StatCard
              key={stat.key}
              {...stat}
              value={isLoading ? <LoaderCircle className="size-6 animate-spin text-slate-400" /> : hospitalStats[stat.key]}
            />
          ))}
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <XCircle className="size-5 shrink-0" />
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.055)]">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <label className="flex h-11 min-w-[360px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 focus-within:border-[#D90429] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
              <Search className="size-5 shrink-0 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search hospital name, registration number..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>

            {[
              { value: statusFilter, onChange: setStatusFilter, options: statusOptions, label: "Status" },
              { value: typeFilter, onChange: setTypeFilter, options: hospitalTypeOptions, label: "Hospital Type" },
              { value: cityFilter, onChange: setCityFilter, options: cityOptions, label: "City" },
            ].map((select) => (
              <label key={select.label} className="relative block w-[165px] shrink-0">
                <select
                  value={select.value}
                  onChange={(event) => select.onChange(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-bold text-slate-700 outline-none focus:border-[#D90429] focus:ring-4 focus:ring-red-100"
                >
                  {select.options.map((option) => (
                    <option key={option} value={option}>
                      {option === "All" ? `All ${select.label}` : formatLabel(option)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              </label>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.055)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-950">Hospitals</h2>
              <p className="mt-0.5 text-[11px] font-bold text-slate-500">Review registrations, contact details, and account status.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
              {visibleHospitals.length} hospitals
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead className="bg-slate-50/80 text-[10px] font-extrabold uppercase text-slate-500">
                <tr>
                  {["Hospital","Type", "Status","City", "Joined", "Action"].map((heading) => (
                    <th
                      key={heading}
                      className={`px-4 py-2.5 ${heading === "Action" ? "text-center" : ""}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <LoaderCircle className="mx-auto size-7 animate-spin text-slate-400" />
                    </td>
                  </tr>
                ) : paginatedHospitals.length ? (
                  paginatedHospitals.map((hospitalItem) => (
                    <tr key={hospitalItem.id} className="align-middle transition hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-extrabold text-white">
                            {getInitials(hospitalItem.name)}
                          </span>
                          <p className="whitespace-nowrap text-xs font-extrabold text-slate-950">{hospitalItem.name}</p>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#D90429]">
                            <Building2 className="size-3.5" />
                          </span>
                          <span className="whitespace-nowrap">{formatLabel(hospitalItem.hospitalType)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-extrabold ring-1 ${statusBadgeClass[hospitalItem.accountStatus] || statusBadgeClass.pending}`}>
                          {formatLabel(hospitalItem.accountStatus)}
                        </span>
                      </td>
                     
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">{hospitalItem.city}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-700">{hospitalItem.joinedOn}</td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/admin/hospitals/${hospitalItem.id}`}
                          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#D90429] hover:text-[#D90429]"
                          aria-label={`${hospitalItem.accountStatus === "pending" ? "Review" : "View"} ${hospitalItem.name}`}
                        >
                          <Eye className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <p className="text-sm font-extrabold text-slate-800">No hospitals found</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">Try changing the search or filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {visibleHospitals.length > hospitalsPerPage ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <p className="text-xs font-bold text-slate-500">
                Showing {(currentPage - 1) * hospitalsPerPage + 1}-
                {Math.min(currentPage * hospitalsPerPage, visibleHospitals.length)} of {visibleHospitals.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-[#D90429] hover:text-[#D90429] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Previous
                </button>
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:border-[#D90429] hover:text-[#D90429] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
};
