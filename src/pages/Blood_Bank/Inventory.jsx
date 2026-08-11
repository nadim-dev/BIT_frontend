import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplet,
  Pencil,
  MoreVertical,
  PackageCheck,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  addMyBloodBankInventory,
  deleteMyBloodBankInventory,
  getMyBloodBankProfile,
  updateMyBloodBankInventory,
} from "../../api/bloodBankApi";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const componentStyles = {
  PRBC: {
    icon: "▣",
    badge: "bg-red-50 text-red-600",
  },
  Platelets: {
    icon: "⌬",
    badge: "bg-amber-50 text-amber-600",
  },
  Plasma: {
    icon: "◧",
    badge: "bg-violet-50 text-violet-600",
  },
};

const bloodGroupClass = "bg-red-50 text-red-600";

const initialInventoryForm = {
  bloodGroup: "O+",
  type: "PRBC",
  unitsAvailable: "",
  processingFee: "",
  expiryDate: "",
};

const ROWS_PER_PAGE = 8;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const getDaysUntilExpiry = (value) => {
  if (!value) return null;

  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry.getTime() - today.getTime()) / MS_PER_DAY);
};

const getStatus = (item) => {
  const unitsAvailable = Number(item.unitsAvailable || 0);
  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);

  if (unitsAvailable <= 0) return "Out of Stock";
  if (daysUntilExpiry !== null && daysUntilExpiry <= 7) return "Expiring Soon";
  return "Available";
};

const statusClasses = {
  Available: "bg-emerald-50 text-emerald-700",
  "Expiring Soon": "bg-amber-50 text-amber-700",
  "Out of Stock": "bg-red-50 text-red-700",
};

const statCards = [
  {
    key: "total",
    label: "Total Units",
    helper: "All components",
    icon: Droplet,
    iconClass: "bg-red-50 text-red-500",
    accentClass: "from-red-50 to-white border-red-100",
  },
  {
    key: "available",
    label: "Available Units",
    helper: "Ready to issue",
    icon: PackageCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
    accentClass: "from-emerald-50 to-white border-emerald-100",
  },
  {
    key: "expiring",
    label: "Expiring Soon",
    helper: "Next 7 days",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-600",
    accentClass: "from-amber-50 to-white border-amber-100",
  },
  {
    key: "outOfStock",
    label: "Out of Stock",
    helper: "Inventory types",
    icon: AlertTriangle,
    iconClass: "bg-violet-50 text-violet-600",
    accentClass: "from-violet-50 to-white border-violet-100",
  },
];

const Sparkline = ({ color = "#ef4444" }) => (
  <svg viewBox="0 0 88 34" className="h-7 w-16" aria-hidden="true">
    <path
      d="M2 25 L10 28 L17 21 L24 26 L31 10 L38 24 L45 18 L52 23 L59 8 L66 27 L73 4 L80 25 L86 30"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export const BloodBankInventory = () => {
  const { setHeaderContent } = useOutletContext();
  const [bloodBank, setBloodBank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [componentFilter, setComponentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inventoryForm, setInventoryForm] = useState(initialInventoryForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    processingFee: "",
    expiryDate: "",
    unitsAvailable: "",
  });
  const [editError, setEditError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setHeaderContent({
      title: "Blood Inventory",
      subtitle: "Manage blood stock, availability, components, and expiry",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    let isMounted = true;

    const loadInventory = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getMyBloodBankProfile();
        if (isMounted) setBloodBank(response?.bloodBank || null);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError?.response?.data?.message || "Unable to load inventory");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInventory();

    return () => {
      isMounted = false;
    };
  }, []);

  const inventory = useMemo(
    () =>
      (bloodBank?.inventory || []).map((item) => ({
        ...item,
        component: item.type || item.component || "PRBC",
        status: getStatus(item),
        unitsAvailable: Number(item.unitsAvailable || 0),
        unitsCommitted: Number(item.unitsCommitted || 0),
        processingFee: Number(item.processingFee || 0),
      })),
    [bloodBank?.inventory],
  );

  const stats = useMemo(() => {
    const total = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);
    const expiring = inventory
      .filter((item) => item.status === "Expiring Soon")
      .reduce((sum, item) => sum + item.unitsAvailable, 0);
    const outOfStock = inventory.filter((item) => item.status === "Out of Stock").length;

    return {
      total,
      available: Math.max(total - expiring, 0),
      expiring,
      outOfStock,
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.bloodGroup?.toLowerCase().includes(normalizedSearch) ||
        item.component?.toLowerCase().includes(normalizedSearch);
      const matchesComponent = componentFilter === "All" || item.component === componentFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "In Stock" && item.unitsAvailable > 0) ||
        (availabilityFilter === "Empty" && item.unitsAvailable <= 0);

      return matchesSearch && matchesComponent && matchesStatus && matchesAvailability;
    });
  }, [availabilityFilter, componentFilter, inventory, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [availabilityFilter, componentFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredInventory.length / ROWS_PER_PAGE), 1);
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * ROWS_PER_PAGE;
  const paginatedInventory = filteredInventory.slice(pageStartIndex, pageStartIndex + ROWS_PER_PAGE);
  const visibleStart = filteredInventory.length ? pageStartIndex + 1 : 0;
  const visibleEnd = Math.min(pageStartIndex + ROWS_PER_PAGE, filteredInventory.length);
  const visiblePageNumbers = useMemo(() => {
    const firstPage = Math.max(1, Math.min(safeCurrentPage - 2, totalPages - 4));
    const lastPage = Math.min(totalPages, firstPage + 4);

    return Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index);
  }, [safeCurrentPage, totalPages]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const updateInventoryForm = (field, value) => {
    setInventoryForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const closeAddModal = () => {
    if (isSaving) return;
    setIsAddModalOpen(false);
    setFormError("");
    setInventoryForm(initialInventoryForm);
  };

  const openDeleteModal = (item) => {
    setOpenActionId("");
    setDeleteError("");
    setDeleteTarget(item);
  };

  const openEditModal = (item) => {
    setOpenActionId("");
    setEditError("");
    setEditTarget(item);
    setEditForm({
      processingFee: String(item.processingFee || ""),
      expiryDate: formatDateInput(item.expiryDate),
      unitsAvailable: String(item.unitsAvailable || ""),
    });
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setEditTarget(null);
    setEditError("");
    setEditForm({
      processingFee: "",
      expiryDate: "",
      unitsAvailable: "",
    });
  };

  const updateEditForm = (field, value) => {
    setEditForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const handleDeleteInventory = async () => {
    if (!deleteTarget?._id) return;

    if (Number(deleteTarget.unitsCommitted || 0) > 0) {
      setDeleteError("This inventory has committed blood, so it cannot be deleted.");
      return;
    }

    try {
      setIsDeleting(true);
      const response = await deleteMyBloodBankInventory(deleteTarget._id);
      setBloodBank(response?.bloodBank || null);
      setIsDeleting(false);
      closeDeleteModal();
    } catch (deleteRequestError) {
      setDeleteError(deleteRequestError?.response?.data?.message || "Unable to delete inventory.");
      setIsDeleting(false);
    }
  };

  const handleUpdateInventory = async (event) => {
    event.preventDefault();
    setEditError("");

    if (!editTarget?._id) return;

    if (!editForm.processingFee || !editForm.expiryDate || !editForm.unitsAvailable) {
      setEditError("Processing fee, expiry date, and units available are required.");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await updateMyBloodBankInventory(editTarget._id, {
        processingFee: Number(editForm.processingFee),
        expiryDate: editForm.expiryDate,
        unitsAvailable: Number(editForm.unitsAvailable),
      });
      setBloodBank(response?.bloodBank || null);
      setIsUpdating(false);
      closeEditModal();
    } catch (updateError) {
      setEditError(updateError?.response?.data?.message || "Unable to update inventory.");
      setIsUpdating(false);
    }
  };

  const handleAddInventory = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!inventoryForm.unitsAvailable || !inventoryForm.processingFee || !inventoryForm.expiryDate) {
      setFormError("Units available, processing fee, and expiry date are required.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await addMyBloodBankInventory({
        bloodGroup: inventoryForm.bloodGroup,
        type: inventoryForm.type,
        unitsAvailable: Number(inventoryForm.unitsAvailable),
        unitsCommitted: 0,
        processingFee: Number(inventoryForm.processingFee),
        expiryDate: inventoryForm.expiryDate,
      });
      setBloodBank(response?.bloodBank || null);
      setIsSaving(false);
      closeAddModal();
    } catch (submitError) {
      setFormError(submitError?.response?.data?.message || "Unable to add inventory.");
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const sparklineColors = ["#fb7185", "#4ade80", "#f59e0b", "#a78bfa"];

          return (
            <div
              key={card.key}
              className={`flex min-h-24 items-center justify-between rounded-lg border bg-gradient-to-br ${card.accentClass} p-3.5 shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${card.iconClass}`}>
                  <Icon size={21} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">{card.label}</p>
                  <p className="mt-0.5 text-2xl font-extrabold tracking-normal text-slate-950">
                    {stats[card.key]}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{card.helper}</p>
                </div>
              </div>
              <Sparkline color={sparklineColors[index]} />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-red-200 focus:ring-4 focus:ring-red-50"
            placeholder="Search by blood group or component..."
          />
        </label>

        <select
          value={componentFilter}
          onChange={(event) => setComponentFilter(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-200 focus:ring-4 focus:ring-red-50 xl:w-36"
        >
          <option>All</option>
          <option>PRBC</option>
          <option>Platelets</option>
          <option>Plasma</option>
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-200 focus:ring-4 focus:ring-red-50 xl:w-36"
        >
          <option>All</option>
          <option>Available</option>
          <option>Expiring Soon</option>
          <option>Out of Stock</option>
        </select>

        <select
          value={availabilityFilter}
          onChange={(event) => setAvailabilityFilter(event.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-red-200 focus:ring-4 focus:ring-red-50 xl:w-36"
        >
          <option>All</option>
          <option>In Stock</option>
          <option>Empty</option>
        </select>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="cursor-pointer inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white shadow-sm shadow-red-200 transition hover:bg-red-700"
        >
          <Plus size={16} />
          Add Inventory
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead className="bg-slate-50">
              <tr>
                {[
                  "Blood Group",
                  "Component",
                  "Units Available",
                  "Units Committed",
                  "Processing Fee",
                  "Expiry Date",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-normal text-slate-600"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-7 text-center text-sm font-semibold text-slate-500" colSpan={8}>
                    Loading inventory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-4 py-7 text-center text-sm font-semibold text-red-600" colSpan={8}>
                    {error}
                  </td>
                </tr>
              ) : filteredInventory.length ? (
                paginatedInventory.map((item) => (
                  <tr key={item._id || `${item.component}-${item.bloodGroup}-${item.expiryDate}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${bloodGroupClass}`}>
                        <Droplet size={13} fill="currentColor" />
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-md text-[10px] font-black ${
                            componentStyles[item.component]?.badge || "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {componentStyles[item.component]?.icon || "•"}
                        </span>
                        {item.component}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-extrabold text-emerald-600">
                      {item.unitsAvailable} units
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                      {item.unitsCommitted} units
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">
                      ₹{item.processingFee}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                      {formatDate(item.expiryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${statusClasses[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionId((currentId) => (currentId === item._id ? "" : item._id))
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                          aria-label={`Open actions for ${item.bloodGroup} ${item.component}`}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openActionId === item._id && (
                          <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
                            >
                              <span className="grid h-6 w-6 place-items-center rounded-md bg-red-50 text-red-500">
                                <Pencil size={13} />
                              </span>
                              Edit Inventory
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(item)}
                              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                            >
                              <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-500">
                                <Trash2 size={13} />
                              </span>
                              Delete Inventory
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-7 text-center text-sm font-semibold text-slate-500" colSpan={8}>
                    No inventory rows match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && !error && filteredInventory.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {visibleStart} to {visibleEnd} of {filteredInventory.length} items
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Previous inventory page"
              >
                <ChevronLeft size={15} />
              </button>
              {visiblePageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 min-w-8 rounded-md px-2 text-xs font-extrabold transition ${
                    safeCurrentPage === page
                      ? "bg-red-600 text-white shadow-sm shadow-red-100"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Next inventory page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <form
            onSubmit={handleAddInventory}
            className="w-full max-w-xl rounded-lg bg-white shadow-2xl shadow-slate-900/20"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-950">Add Inventory</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">Create a new stock entry for this blood bank.</p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close add inventory modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Blood Group</span>
                <select
                  value={inventoryForm.bloodGroup}
                  onChange={(event) => updateInventoryForm("bloodGroup", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                >
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Component</span>
                <select
                  value={inventoryForm.type}
                  onChange={(event) => updateInventoryForm("type", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                >
                  <option>PRBC</option>
                  <option>Platelets</option>
                  <option>Plasma</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Units Available</span>
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.unitsAvailable}
                  onChange={(event) => updateInventoryForm("unitsAvailable", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                  placeholder="0"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Processing Fee</span>
                <input
                  type="number"
                  min="0"
                  value={inventoryForm.processingFee}
                  onChange={(event) => updateInventoryForm("processingFee", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                  placeholder="500"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Expiry Date</span>
                <input
                  type="date"
                  value={inventoryForm.expiryDate}
                  onChange={(event) => updateInventoryForm("expiryDate", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                />
              </label>
            </div>

            {formError && (
              <p className="mx-5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{formError}</p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeAddModal}
                className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="h-10 rounded-lg bg-red-600 px-5 text-xs font-bold text-white shadow-sm shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Inventory"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl shadow-slate-900/20">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-950">Delete Inventory</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Confirm deletion for {deleteTarget.bloodGroup} {deleteTarget.component}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close delete inventory modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 px-5 py-5">
              <p className="text-sm font-semibold text-slate-700">
                Are you sure you want to delete this inventory entry? This action cannot be undone.
              </p>
              {Number(deleteTarget.unitsCommitted || 0) > 0 && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                  This item has {deleteTarget.unitsCommitted} committed unit
                  {deleteTarget.unitsCommitted === 1 ? "" : "s"} and cannot be deleted.
                </p>
              )}
              {deleteError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteInventory}
                disabled={isDeleting || Number(deleteTarget.unitsCommitted || 0) > 0}
                className="h-10 rounded-lg bg-red-600 px-5 text-xs font-bold text-white shadow-sm shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete Inventory"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <form
            onSubmit={handleUpdateInventory}
            className="w-full max-w-md rounded-lg bg-white shadow-2xl shadow-slate-900/20"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-950">Edit Inventory</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Update {editTarget.bloodGroup} {editTarget.component} stock details.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close edit inventory modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Processing Fee</span>
                <input
                  type="number"
                  min="0"
                  value={editForm.processingFee}
                  onChange={(event) => updateEditForm("processingFee", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                  placeholder="500"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Expiry Date</span>
                <input
                  type="date"
                  value={editForm.expiryDate}
                  onChange={(event) => updateEditForm("expiryDate", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">Units Available</span>
                <input
                  type="number"
                  min="0"
                  value={editForm.unitsAvailable}
                  onChange={(event) => updateEditForm("unitsAvailable", event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-200 focus:ring-4 focus:ring-red-50"
                  placeholder="25"
                />
              </label>

              {editError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{editError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeEditModal}
                className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="h-10 rounded-lg bg-red-600 px-5 text-xs font-bold text-white shadow-sm shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
