import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {Ban,Building2,CheckCircle2,ChevronDown,Clock3,Eye,LoaderCircle,MapPin,Search,XCircle} from "lucide-react";
import { getAllAdminBloodBanks } from "../../api/bloodBankApi.js";
import { formatDateOnly } from "../../utils/dateCustomization.js";

const statuses = ["All", "Pending", "Approved", "Rejected", "Suspended"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const statusClass = {
  Pending: "bg-orange-50 text-orange-700 ring-orange-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
  Suspended: "bg-slate-100 text-slate-700 ring-slate-200",
};

const statTone = {
  total: "bg-red-50 text-[#D90429]",
  pending: "bg-orange-50 text-orange-600",
  approved: "bg-emerald-50 text-emerald-600",
  rejected: "bg-red-50 text-red-600",
  suspended: "bg-slate-100 text-slate-600",
};

const getLocation = (bloodBank) => {
  const address = bloodBank.address || {};
  const parts = [address.city, address.district, address.state].filter(Boolean);

  return parts.length ? parts.join(", ") : address.completeAddress || "Not available";
};

const normalizeBloodBank = (bloodBank) => ({
  id: bloodBank._id,
  name: bloodBank.bloodBankName || "Unnamed blood bank",
  email: bloodBank.userId?.email || "Not available",
  contactPerson: bloodBank.contactPersonName || "Not available",
  phone: bloodBank.phoneNumber || "Not available",
  location: getLocation(bloodBank),
  licenseNumber: bloodBank.licenseNumber || "",
  status: bloodBank.status || "Pending",
  createdAt: bloodBank.createdAt,
  registeredOn: formatDateOnly(bloodBank.createdAt, "Not available"),
});

function StatCard({ title, value, subtitle, icon: Icon, tone, index }) {
  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.055)]"
    >
      <div className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-4">
        <span className={`flex size-12 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 text-left">
          <p className="truncate text-xs font-extrabold leading-4 text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-extrabold leading-7 text-slate-950">{value}</p>
          <p className="mt-1 max-w-[150px] text-xs font-semibold leading-4 text-slate-500">{subtitle}</p>
        </div>
      </div>
    </motion.article>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ring-1 ${statusClass[status] || statusClass.Pending}`}>
      {status}
    </span>
  );
}

export const AdminBloodBanks = () => {
  const { setHeaderContent } = useOutletContext();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Blood Banks",
      subtitle: "Manage registered blood banks and review their registration requests.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchBloodBanks = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAllAdminBloodBanks();
        setBloodBanks((response?.bloodBanks || []).map(normalizeBloodBank));
      } catch (err) {
        setError(err.message || "Unable to load blood banks.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBloodBanks();
  }, []);

  const stats = useMemo(() => [
    {
      title: "Approved",
      value: bloodBanks.filter((bank) => bank.status === "Approved").length,
      subtitle: "Active blood banks",
      icon: CheckCircle2,
      tone: statTone.approved,
    },
    {
      title: "Pending Requests",
      value: bloodBanks.filter((bank) => bank.status === "Pending").length,
      subtitle: "Awaiting review",
      icon: Clock3,
      tone: statTone.pending,
    },
    {
      title: "Suspended",
      value: bloodBanks.filter((bank) => bank.status === "Suspended").length,
      subtitle: "Suspended blood banks",
      icon: Ban,
      tone: statTone.suspended,
    },
    {
      title: "Rejected",
      value: bloodBanks.filter((bank) => bank.status === "Rejected").length,
      subtitle: "Registration rejected",
      icon: XCircle,
      tone: statTone.rejected,
    },
  ], [bloodBanks]);

  const cities = useMemo(() => {
    const values = bloodBanks
      .map((bank) => bank.location.split(",")[0]?.trim())
      .filter((value) => value && value !== "Not available");

    return ["All", ...new Set(values)];
  }, [bloodBanks]);

  const visibleBloodBanks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bloodBanks
      .filter((bank) => {
        const matchesSearch =
          !query ||
          [bank.name, bank.email, bank.contactPerson, bank.phone, bank.location, bank.licenseNumber]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));
        const matchesStatus = statusFilter === "All" || bank.status === statusFilter;
        const matchesCity = cityFilter === "All" || bank.location.startsWith(cityFilter);

        return matchesSearch && matchesStatus && matchesCity;
      })
      .sort((first, second) => {
        if (sortBy === "oldest") {
          return new Date(first.createdAt) - new Date(second.createdAt);
        }

        return new Date(second.createdAt) - new Date(first.createdAt);
      });
  }, [bloodBanks, cityFilter, searchTerm, sortBy, statusFilter]);

  const navigate=useNavigate();

  return (
    <section className="min-h-[calc(100vh-120px)] bg-[#F8FAFC] px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} index={index} />
          ))}
        </div>

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35, delay: 0.14 }}
          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.055)]"
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px_170px]">
            <label className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 focus-within:border-[#D90429] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
              <Search className="size-5 shrink-0 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search blood bank name, contact person..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>

            {[
              { value: statusFilter, onChange: setStatusFilter, options: statuses, label: "status" },
              { value: cityFilter, onChange: setCityFilter, options: cities, label: "city" },
              { value: sortBy, onChange: setSortBy, options: ["newest", "oldest"], label: "sort" },
            ].map((select) => (
              <label key={select.label} className="relative block">
                <select
                  value={select.value}
                  onChange={(event) => select.onChange(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-bold text-slate-700 outline-none focus:border-[#D90429] focus:ring-4 focus:ring-red-100"
                >
                  {select.options.map((option) => (
                    <option key={option} value={option}>
                      {select.label === "sort"
                        ? `Sort by: ${option === "newest" ? "Newest" : "Oldest"}`
                        : option === "All"
                          ? `All ${select.label === "city" ? "Cities" : "Statuses"}`
                          : option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              </label>
            ))}
          </div>
        </motion.section>

        <div className="flex flex-wrap gap-5 border-b border-slate-200 px-2 pt-1 text-sm font-extrabold">
          {statuses.map((status) => {
            const count = status === "All"
              ? bloodBanks.length
              : bloodBanks.filter((bank) => bank.status === status).length;
            const isActive = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`border-b-2 pb-3 transition ${
                  isActive
                    ? "border-[#D90429] text-[#D90429]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {status === "All" ? "All Blood Banks" : status} ({count})
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.055)]">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-sm font-bold text-slate-500">
              <LoaderCircle className="mr-2 inline size-5 animate-spin text-[#D90429]" />
              Loading blood banks...
            </div>
          ) : visibleBloodBanks.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr>
                    {["Blood Bank", "Contact Person", "Location", "Status", "Registered On", "Actions"].map((heading) => (
                      <th key={heading} className="px-5 py-3.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleBloodBanks.map((bank) => (
                    <tr key={bank.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-[#D90429]">
                            <Building2 className="size-4" />
                          </span>
                          <div>
                            <p className="text-xs font-extrabold leading-5 text-slate-950">{bank.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold leading-5 text-slate-800">{bank.contactPerson}</p>
                      </td>
                      <td className="max-w-[260px] px-5 py-3.5">
                        <p className="text-xs font-bold leading-5 text-slate-800">
                          <MapPin className="mr-1.5 inline size-3.5 text-slate-400" />
                          {bank.location}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={bank.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">{bank.registeredOn}</td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          className="inline-flex cursor-pointer size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#D90429] hover:text-[#D90429]"
                          aria-label={`View ${bank.name}`}
                          onClick={()=>navigate(`/admin/blood-bank/${bank.id}`)}
                        >
                          <Eye className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm font-bold text-slate-500">
              No blood banks found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
