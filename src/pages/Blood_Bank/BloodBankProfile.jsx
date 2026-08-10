import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {Building2,Camera,Clock,FileBadge,LockKeyhole,MapPin,Phone,Save,ShieldCheck,UserRound,X,} from "lucide-react";
import { getMyBloodBankProfile, updateMyBloodBankProfile } from "../../api/bloodBankApi";
import { updateProfilePictureApi } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import getInitials from "../../utils/getInitial";

const emptyForm = {
  contactPersonName: "",
  phoneNumber: "",
  openingTime: "",
  closingTime: "",
  isOpen24Hours: false,
};


const toForm=(bloodBank) => ({
  contactPersonName: bloodBank?.contactPersonName || "",
  phoneNumber: bloodBank?.phoneNumber || "",
  openingTime: bloodBank?.workingHours?.openingTime || "",
  closingTime: bloodBank?.workingHours?.closingTime || "",
  isOpen24Hours: Boolean(bloodBank?.workingHours?.isOpen24Hours),
});

const isSameForm = (firstForm, secondForm) =>
  firstForm.contactPersonName === secondForm.contactPersonName &&
  firstForm.phoneNumber === secondForm.phoneNumber &&
  firstForm.openingTime === secondForm.openingTime &&
  firstForm.closingTime === secondForm.closingTime &&
  firstForm.isOpen24Hours === secondForm.isOpen24Hours;

const getFullAddress = (bloodBank) => {
  const addressParts = [
    bloodBank?.address?.completeAddress,
    bloodBank?.address?.city,
    bloodBank?.address?.district,
    bloodBank?.address?.state,
  ].filter(Boolean);

  return addressParts.join(", ") || "Unavailable";
};

const getStatusClass = (status) => {
  const styles = {
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Pending: "bg-amber-50 text-amber-700 border-amber-100",
    Rejected: "bg-red-50 text-red-700 border-red-100",
    Suspended: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  return styles[status] || styles.Pending;
};

export const BloodBankProfile = () => {
  const { user, setHeaderContent } = useOutletContext();
  const { setCurrentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [bloodBank, setBloodBank] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState("");

  const operatorName = user?.username || bloodBank?.contactPersonName || "Blood bank operator";
  const avatar = previewAvatar || user?.picture;
  const savedForm = toForm(bloodBank);
  const hasUnsavedChanges = !isSameForm(form, savedForm);

  useEffect(() => {
    setHeaderContent({
      title: "Blood Bank Profile",
      subtitle: "Manage your blood bank information, services, and operating details",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await getMyBloodBankProfile();

        if (!isMounted) return;

        setBloodBank(data.bloodBank);
        setForm(toForm(data.bloodBank));
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load blood bank profile");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    setError("");
    setSuccess("");
    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isOpen24Hours" && checked
        ? { openingTime: "", closingTime: "" }
        : {}),
    }));
  };

  const handleCancel = () => {
    setForm(toForm(bloodBank));
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.contactPersonName.trim() || !form.phoneNumber.trim()) {
      setError("Contact person and phone number are required.");
      return;
    }

    if (!form.isOpen24Hours && (!form.openingTime || !form.closingTime)) {
      setError("Opening and closing time are required unless the blood bank is open 24 hours.");
      return;
    }

    if (!hasUnsavedChanges) {
      setError("");
      setSuccess("No changes to save.");
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");
      const data = await updateMyBloodBankProfile(form);
      setBloodBank(data.bloodBank);
      setForm(toForm(data.bloodBank));
      setCurrentUser((currentUser) => ({
        ...currentUser,
        username: form.contactPersonName,
        phoneNumber: form.phoneNumber,
      }));
      setIsEditing(false);
      setSuccess(data.message || "Blood bank profile updated successfully");
    } catch (err) {
      setError(err.message || "Unable to update blood bank profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (previewAvatar) {
      URL.revokeObjectURL(previewAvatar);
    }

    setPreviewAvatar(URL.createObjectURL(file));
    setUploadError("");
    setIsUploading(true);

    try {
      const data = await updateProfilePictureApi(file);
      setCurrentUser(data.currentUser);
      setPreviewAvatar("");
    } catch (err) {
      setUploadError(err.message || "Unable to update profile image");
      setPreviewAvatar("");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[360px] place-items-center py-8">
        <p className="text-sm font-bold text-zinc-500">Loading blood bank profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 bg-[linear-gradient(135deg,#fff7f7_0%,#ffffff_55%,#f8fafc_100%)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative size-20 shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={operatorName}
                  className="size-20 rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="grid size-20 place-items-center rounded-full border-4 border-white bg-[#fb2c36] text-lg font-extrabold text-white shadow-md">
                  {getInitials(operatorName)}
                </div>
              )}

              <button
                type="button"
                aria-label="Change operator profile image"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 grid size-7 cursor-pointer place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera className="size-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-extrabold text-zinc-950">
                  {bloodBank?.bloodBankName || "Blood Bank"}
                </h2>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-extrabold ${getStatusClass(bloodBank?.status)}`}>
                  {bloodBank?.status || "Pending"}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-zinc-600">
                Managed by {operatorName}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <InfoPill icon={Phone} text={bloodBank?.phoneNumber || "Phone unavailable"} />
                <InfoPill icon={MapPin} text={bloodBank?.address?.city || bloodBank?.address?.district || "Registered location"} />
              </div>
              {isUploading ? <p className="mt-3 text-xs font-bold text-zinc-500">Updating profile image...</p> : null}
              {uploadError ? <p className="mt-3 text-xs font-bold text-red-600">{uploadError}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-72">
            <SummaryTile label="Status" value={bloodBank?.status || "Pending"} />
            <SummaryTile label="License" value={bloodBank?.licenseDocument?.isVerified ? "Verified" : "Submitted"} />
          </div>
        </div>
      </section>

      {error ? <Alert tone="error" message={error} /> : null}
      {success ? <Alert tone="success" message={success} /> : null}

      <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handleSubmit}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-zinc-950">Profile Information</h3>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Edit contact and hours. Registration details stay locked for verification.
            </p>
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="size-3.5" />
                Cancel
              </button>
                <button
                  type="submit"
                  disabled={isSaving || !hasUnsavedChanges}
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#fb2c36] px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#d91f28] disabled:cursor-not-allowed disabled:opacity-60"
                >
                <Save className="size-3.5" />
                {isSaving ? "Saving" : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setIsEditing(true);
              }}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-zinc-950 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Edit Details
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
            <h4 className="text-sm font-extrabold text-zinc-950">Editable Details</h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Field icon={UserRound} label="Contact Person" name="contactPersonName" value={form.contactPersonName} onChange={handleInputChange} disabled={!isEditing} />
              <Field icon={Phone} label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} disabled={!isEditing} />
            </div>

            <div className="mt-4 rounded-lg border border-red-100 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-[#fb2c36]" />
                  <h4 className="text-sm font-extrabold text-zinc-950">Working Hours</h4>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-extrabold text-zinc-700">
                  <input
                    type="checkbox"
                    name="isOpen24Hours"
                    checked={form.isOpen24Hours}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="size-4 accent-[#fb2c36]"
                  />
                  Open 24 hours
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <TimeField label="Opening Time" name="openingTime" value={form.openingTime} onChange={handleInputChange} disabled={!isEditing || form.isOpen24Hours} />
                <TimeField label="Closing Time" name="closingTime" value={form.closingTime} onChange={handleInputChange} disabled={!isEditing || form.isOpen24Hours} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-100 bg-white p-4">
            <h4 className="flex items-center gap-2 text-sm font-extrabold text-zinc-950">
              <LockKeyhole className="size-4 text-zinc-500" />
              Locked Registration Details
            </h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <LockedDetail icon={Building2} label="Blood Bank Name" value={bloodBank?.bloodBankName || "Unavailable"} />
              <LockedDetail icon={FileBadge} label="License Number" value={bloodBank?.licenseNumber || "Unavailable"} />
              <LockedDetail icon={ShieldCheck} label="Approval Status" value={bloodBank?.status || "Pending"} />
              <LockedDetail icon={MapPin} label="Exact Map Location" value="Locked after verification" />
              <LockedDetail icon={MapPin} label="Registered Address" value={getFullAddress(bloodBank)} wide />
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-lg border border-red-100 bg-red-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h4 className="flex items-center gap-2 text-sm font-extrabold text-zinc-950">
                  <FileBadge className="size-4 text-[#fb2c36]" />
                  License Document
                </h4>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  Protected after submission.
                </p>
              </div>
              {bloodBank?.licenseDocument?.url ? (
                <a
                  href={bloodBank.licenseDocument.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-red-100 bg-white px-4 text-xs font-extrabold text-[#fb2c36] transition hover:bg-red-50"
                >
                  View License
                </a>
              ) : (
                <span className="text-xs font-bold text-zinc-500">Unavailable</span>
              )}
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};

function InfoPill({ icon: Icon, text }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-sm">
      <Icon className="size-3.5 shrink-0 text-[#fb2c36]" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-lg border border-white bg-white/80 px-3 py-2 shadow-sm">
      <p className="text-[10px] font-extrabold uppercase text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-xs font-extrabold text-zinc-950">{value}</p>
    </div>
  );
}

function Alert({ tone, message }) {
  const isSuccess = tone === "success";

  return (
    <p className={`rounded-md px-4 py-3 text-xs font-bold ${isSuccess ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
      {message}
    </p>
  );
}

function Field({ icon: Icon, label, name, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-xs font-bold text-zinc-500">
        <Icon className="size-4" />
        {label}
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-1.5 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-zinc-50 disabled:text-zinc-500"
      />
    </label>
  );
}

function TimeField({ label, name, value, onChange, disabled }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      <input
        type="time"
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="mt-1.5 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-white/60 disabled:text-zinc-400"
      />
    </label>
  );
}

function LockedDetail({ icon: Icon, label, value, wide = false }) {
  return (
    <div className={`grid grid-cols-[32px_minmax(0,1fr)] gap-3 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-3 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="grid size-8 place-items-center rounded-md bg-white text-zinc-500">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase text-zinc-400">{label}</p>
        <p className="mt-1 truncate text-xs font-extrabold text-zinc-800">{value}</p>
      </div>
    </div>
  );
}
