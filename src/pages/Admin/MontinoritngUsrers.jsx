import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {CalendarDays,ChevronLeft,ChevronRight,Droplet,Eye,Funnel,LoaderCircle,Mail,MapPin,MoreVertical,Phone,Search,ShieldCheck,ShieldOff,UserRound,Users,X,} from "lucide-react";
import { getAdminUserDetails, getAllUsers, getAllUsersStats, suspendUser } from "../../api/donorApi";
import { formatDateOnly, formatTicketDate } from "../../utils/dateCustomization";
import getInitials from "../../utils/getInitial";
const statCards = [
  {
    key: "total",
    label: "Total users",
    subtitle: "All registered users",
    icon: Users,
    tone: "text-red-500 bg-red-50",
  },
  {
    key: "donors",
    label: "Donors",
    subtitle: "Verified donors",
    icon: Droplet,
    tone: "text-emerald-500 bg-emerald-50",
  },
  {
    key: "active",
    label: "Active users",
    subtitle: "Active accounts",
    icon: UserRound,
    tone: "text-blue-500 bg-blue-50",
  },
  {
    key: "suspended",
    label: "Suspended",
    subtitle: "Suspended accounts",
    icon: ShieldCheck,
    tone: "text-orange-500 bg-orange-50",
  },
];
const bloodGroups = [
  "All Blood Groups",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];
const selectClass =
  "h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none focus:border-red-300";
const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

const formatLabel = (value) => {
  if (!value) return "Not available";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

const formatCoordinates = (location) => {
  const coordinates = location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return "Not available";
  const [longitude, latitude] = coordinates;
  return `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
};

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-800">{value || "Not available"}</p>
    </div>
  );
}

function UserDetailsModal({ details, isLoading, onClose }) {
  const user = details?.user;
  const donor = details?.donor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-5 backdrop-blur-sm">
      <section className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-extrabold text-slate-600">
              {user?.picture ? <img src={user.picture} alt={user.username} className="size-full object-cover" /> : getInitials(user?.username)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-slate-950">{user?.username || "User Details"}</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{user?.email || "Loading account details..."}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close user details">
            <X className="size-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid min-h-72 place-items-center">
            <LoaderCircle className="size-6 animate-spin text-red-500" />
          </div>
        ) : (
          <div className="overflow-y-auto p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                  <ShieldCheck className="size-3.5 text-[#D90429]" /> Status
                </div>
                <p className="mt-2 text-sm font-extrabold text-slate-900">{formatStatus(user?.accountStatus)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                  <Droplet className="size-3.5 text-[#D90429]" /> Donor
                </div>
                <p className="mt-2 text-sm font-extrabold text-slate-900">{user?.isDonor ? "Registered donor" : "Not a donor"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                  <CalendarDays className="size-3.5 text-[#D90429]" /> Joined
                </div>
                <p className="mt-2 text-sm font-extrabold text-slate-900">{formatDateOnly(user?.createdAt, "Not available")}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                    <UserRound className="size-4 text-[#D90429]" /> Personal Details
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <DetailItem label="Username" value={user?.username} />
                    <DetailItem label="Role" value={user?.role} />
                    <DetailItem label="Email" value={user?.email} />
                    <DetailItem label="Phone" value={user?.phoneNumber} />
                    <DetailItem label="Gender" value={user?.gender} />
                    <DetailItem label="Date of birth" value={formatDateOnly(user?.dateOfBirth, "Not available")} />
                    <DetailItem label="Auth provider" value={formatLabel(user?.authProvider)} />
                    <DetailItem label="Updated" value={formatTicketDate(user?.updatedAt, "Not available")} />
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                    <MapPin className="size-4 text-[#D90429]" /> Location
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <DetailItem label="City" value={user?.city} />
                    <DetailItem label="District" value={user?.district} />
                    <DetailItem label="State" value={user?.state} />
                    <DetailItem label="Coordinates" value={formatCoordinates(user?.location)} />
                    <DetailItem label="Address" value={user?.short_address} />
                    <DetailItem label="Location updated" value={formatTicketDate(user?.lastLocationUpdatedAt, "Not available")} />
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                    <Droplet className="size-4 text-[#D90429]" /> Donor Details
                  </h3>
                  {donor ? (
                    <div className="mt-3 grid gap-2">
                      <DetailItem label="Blood group" value={donor.bloodGroup} />
                      <DetailItem label="Weight" value={donor.weight ? `${donor.weight} kg` : ""} />
                      <DetailItem label="Availability" value={formatLabel(donor.availability)} />
                      <DetailItem label="Preferred distance" value={donor.preferredDistance ? `${donor.preferredDistance} km` : ""} />
                      <DetailItem label="Health status" value={donor.isHealthy === "yes" ? "Healthy" : "Needs review"} />
                      <DetailItem label="Health reason" value={donor.healthReason || "Not provided"} />
                      <DetailItem label="Donated before" value={formatLabel(donor.hasDonatedBefore)} />
                      <DetailItem label="Last donation" value={formatDateOnly(donor.lastDonationDate, "Not available")} />
                    </div>
                  ) : (
                    <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-4 text-xs font-bold text-slate-500">
                      This user has not completed donor registration.
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <h3 className="text-sm font-extrabold text-slate-950">Quick Contact</h3>
                  <div className="mt-3 space-y-2">
                    <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                      <Mail className="size-3.5 text-slate-400" /> {user?.email || "Not available"}
                    </p>
                    <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                      <Phone className="size-3.5 text-slate-400" /> {user?.phoneNumber || "Not available"}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export const RegisteredUsers = () => {
  const { setHeaderContent } = useOutletContext();
  const [stats, setStats] = useState({
    total: 0,
    donors: 0,
    active: 0,
    suspended: 0,
  });
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [bloodGroup, setBloodGroup] = useState("All Blood Groups");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openActionUserId, setOpenActionUserId] = useState(null);
  const [actionLoadingUserId, setActionLoadingUserId] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    setHeaderContent({
      title: "Users",
      subtitle: "Manage platform users, donors, and account statuses.",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError("");
        const [statsResponse, usersResponse] = await Promise.all([
          getAllUsersStats(),
          getAllUsers({
            page,
            limit: 10,
            tab,
            search,
            status,
            bloodGroup: bloodGroup === "All Blood Groups" ? "All" : bloodGroup,
          }),
        ]);
        const nextStats = statsResponse?.stats || statsResponse || {};
        const total = Number(nextStats.total ?? 0);
        const suspended = Number(nextStats.suspended ?? 0);
        setStats({
          total,
          donors: Number(nextStats.donors ?? 0),
          suspended,
          active: Math.max(total - suspended, 0),
        });
        setUsers(usersResponse?.users || []);
        setPagination(
          usersResponse?.pagination || {
            page,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (err) {
        setError(err.message || "Unable to load users.");
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [page, tab, search, status, bloodGroup]);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setPage(1);
  };
  const firstResult = pagination.total
    ? (pagination.page - 1) * pagination.limit + 1
    : 0;
  const lastResult = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  const handleUserAction = async (action, user) => {
    try {
      setActionLoadingUserId(user._id);
      setOpenActionUserId(null);
      if (action === "suspend") {
        await suspendUser(user._id);
        setUsers((currentUsers) => currentUsers.map((currentUser) => currentUser._id === user._id ? { ...currentUser, accountStatus: "suspended" } : currentUser));
      } else {
        setDetailsModalOpen(true);
        setSelectedUserDetails({ user, donor: null });
        setIsDetailsLoading(true);
        const details = await getAdminUserDetails(user._id);
        setSelectedUserDetails(details);
      }
    } catch (err) {
      setError(err.message || "Unable to complete this action.");
      if (action === "details") setDetailsModalOpen(false);
    } finally {
      setActionLoadingUserId(null);
      if (action === "details") setIsDetailsLoading(false);
    }
  };

  return (
    <section className="mt-5 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, subtitle, icon: Icon, tone }) => (
          <article
            key={key}
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-xl font-extrabold leading-6 text-slate-900">
                  {stats[key].toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  {subtitle}
                </p>
              </div>
              <span
                className={`flex size-7 items-center justify-center rounded-lg ${tone}`}
              >
                <Icon className="size-4" />
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
        <div className="flex gap-7 border-b border-slate-100 px-4 pt-1">
          {[
            ["all", "All Users"],
            ["donors", "Donors"],
            ["suspended", "Suspended Users"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => changeTab(value)}
              className={`border-b-2 px-1 py-3 text-xs font-bold ${tab === value ? "border-red-500 text-red-600" : "border-transparent text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/40 p-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone..."
              className={`${selectClass} w-full pl-9`}
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option>All</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <select
            value={bloodGroup}
            onChange={(event) => {
              setBloodGroup(event.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            {bloodGroups.map((group) => (
              <option key={group}>{group}</option>
            ))}
          </select>
          <button className={`${selectClass} inline-flex items-center gap-2`}>
            <Funnel className="size-3.5" /> Filters
          </button>
        </div>
        {error && (
          <p className="p-4 text-sm font-semibold text-red-600">{error}</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr>
                {[
                  "User",
                  "Role",
                  "Blood group",
                  "Phone",
                  "City",
                  "Status",
                  "Joined",
                  "Action",
                ].map((heading) => (
                  <th key={heading} className={`px-4 py-3 font-extrabold ${heading === "Action" ? "cursor-pointer" : ""}`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center">
                    <LoaderCircle className="mx-auto size-5 animate-spin text-red-500" />
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                    <tr key={user._id} className="text-slate-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[10px] font-extrabold text-slate-600">
                            {user.picture ? <img src={user.picture} alt={user.username} className="size-full object-cover" /> : getInitials(user.username)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800">{user.username}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">{user.email}</p>
                          </div>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-bold ${user.isDonor ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}
                      >
                        {user.isDonor ? "Donor" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{user.bloodGroup || "-"}</td>
                    <td className="px-4 py-3">{user.phoneNumber || "-"}</td>
                    <td className="px-4 py-3">{user.city || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-[11px] font-bold ${user.accountStatus === "suspended" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {formatStatus(user.accountStatus)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDateOnly(user.createdAt, "-")}
                    </td>
                    <td className="relative px-4 py-3">
                      <button title="More actions" onClick={() => setOpenActionUserId((current) => current === user._id ? null : user._id)} disabled={actionLoadingUserId === user._id} className="cursor-pointer rounded-md border border-slate-200 p-1.5 text-slate-500 disabled:opacity-50"><MoreVertical className="size-3.5" /></button>
                      {openActionUserId === user._id && <div className="absolute right-4 top-11 z-20 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"><button onClick={() => handleUserAction("suspend", user)} className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"><ShieldOff className="size-3.5" /> Suspend</button><button onClick={() => handleUserAction("details", user)} className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"><Eye className="size-3.5" /> Details</button></div>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
          <span>
            Showing {firstResult} to {lastResult} of{" "}
            {pagination.total.toLocaleString()} users
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-2 text-slate-700">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
      {detailsModalOpen ? (
        <UserDetailsModal
          details={selectedUserDetails}
          isLoading={isDetailsLoading}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedUserDetails(null);
          }}
        />
      ) : null}
    </section>
  );
};
