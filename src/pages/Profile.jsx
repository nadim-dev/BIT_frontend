import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Cake, CalendarDays, Camera, LockKeyhole, Mail, Mars, Pencil, Phone, Save, ShieldAlert, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { deleteAccountApi, updatePasswordApi, updateProfileApi, updateProfilePictureApi } from "../api/authApi";
import { getCurrentDonor, updateCurrentDonor } from "../api/donorApi";
import { useAuth } from "../hooks/useAuth";
import BecomeDonorCta from "../components/BecomeDonorCta";
import getInitials from "../utils/getInitial";

const getDateFromObjectId = (id) => {
  if (!/^[a-f\d]{24}$/i.test(id || "")) {
    return null;
  }

  return new Date(parseInt(id.slice(0, 8), 16) * 1000);
};

const getMemberSince = (user) => {
  const dateSource = user?.createdAt || getDateFromObjectId(user?._id);

  if (!dateSource) {
    return "Member";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateSource));
};

const formatDate = (date) => {
  if (!date) {
    return "Not Added";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const formatDateInputValue = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().slice(0, 10);
};

const formatAvailability = (availability) => {
  const labels = {
    anytime: "Anytime",
    emergency: "Emergency Only",
    unavailable: "Unavailable",
  };

  return labels[availability] || "Not Added";
};

const formatHealth = (isHealthy) => {
  if (isHealthy === "yes") {
    return "Yes";
  }

  if (isHealthy === "no") {
    return "No";
  }

  return "Not Added";
};

export const ProfilePage = () => {
  const { setHeaderContent, user } = useOutletContext();
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: formatDateInputValue(user?.dateOfBirth),
    gender: user?.gender || "",
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [donorInfo, setDonorInfo] = useState(null);
  const [isLoadingDonorInfo, setIsLoadingDonorInfo] = useState(false);
  const [isEditingDonor, setIsEditingDonor] = useState(false);
  const [isSavingDonor, setIsSavingDonor] = useState(false);
  const [donorError, setDonorError] = useState("");
  const [donorForm, setDonorForm] = useState({
    weight: "",
    isHealthy: "yes",
    healthReason: "",
    availability: "anytime",
    preferredDistance: "10",
  });
  const avatar = previewAvatar || user?.picture;
  const memberSince = getMemberSince(user);
  const hasPassword = Boolean(user?.hasPassword);
  const isBloodBankUser = user?.role === "BloodBank";

  useEffect(() => {
    setHeaderContent({
      title: "My Profile",
      subtitle: "Manage your personal information and account settings",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    return () => {
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setProfileForm({
      username: user?.username || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: formatDateInputValue(user?.dateOfBirth),
      gender: user?.gender || "",
    });
  }, [isEditing, user]);

  useEffect(() => {
    if (!user?.isDonor) {
      setDonorInfo(null);
      return;
    }

    let isMounted = true;

    const loadDonorInfo = async () => {
      try {
        setIsLoadingDonorInfo(true);
        setDonorError("");
        const data = await getCurrentDonor();

        if (!isMounted) {
          return;
        }

        setDonorInfo(data.donor);
        setDonorForm({
          weight: data.donor?.weight?.toString() || "",
          isHealthy: data.donor?.isHealthy || "yes",
          healthReason: data.donor?.healthReason || "",
          availability: data.donor?.availability || "anytime",
          preferredDistance: data.donor?.preferredDistance?.toString() || "10",
        });
      } catch (error) {
        if (isMounted) {
          setDonorError(error.message || "Unable to load donor information");
        }
      } finally {
        if (isMounted) {
          setIsLoadingDonorInfo(false);
        }
      }
    };

    loadDonorInfo();

    return () => {
      isMounted = false;
    };
  }, [user?.isDonor]);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

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
    } catch (error) {
      setUploadError(error.message || "Unable to update profile picture");
      setPreviewAvatar("");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleEditProfile = () => {
    setProfileError("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setProfileError("");
    setProfileForm({
      username: user?.username || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: formatDateInputValue(user?.dateOfBirth),
      gender: user?.gender || "",
    });
    setIsEditing(false);
  };

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setProfileError("");
    setProfileForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!profileForm.username.trim() || !profileForm.phoneNumber.trim() || !profileForm.dateOfBirth || !profileForm.gender) {
      setProfileError("Please fill username, phone number, date of birth, and gender.");
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileError("");
      const data = await updateProfileApi(profileForm);
      setCurrentUser(data.currentUser);
      setIsEditing(false);
    } catch (error) {
      setProfileError(error.message || "Unable to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleCancelPasswordEdit = () => {
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(false);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (hasPassword && !passwordForm.currentPassword.trim()) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Please fill new password and confirm password.");
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setIsSavingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");
      const data = await updatePasswordApi({
        ...(hasPassword ? { currentPassword: passwordForm.currentPassword } : {}),
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setCurrentUser(data.currentUser);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess(data.message || "Password updated successfully");
      setIsEditingPassword(false);
    } catch (error) {
      setPasswordError(error.message || "Unable to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Type DELETE to confirm account deletion.");
      return;
    }

    try {
      setIsDeletingAccount(true);
      setDeleteError("");
      await deleteAccountApi();
      setCurrentUser(null);
      navigate("/register", { replace: true });
    } catch (error) {
      setDeleteError(error.message || "Unable to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleEditDonor = () => {
    setDonorError("");
    setIsEditingDonor(true);
  };

  const handleCancelDonorEdit = () => {
    setDonorError("");
    setDonorForm({
      weight: donorInfo?.weight?.toString() || "",
      isHealthy: donorInfo?.isHealthy || "yes",
      healthReason: donorInfo?.healthReason || "",
      availability: donorInfo?.availability || "anytime",
      preferredDistance: donorInfo?.preferredDistance?.toString() || "10",
    });
    setIsEditingDonor(false);
  };

  const handleDonorInputChange = (event) => {
    const { name, value } = event.target;
    setDonorError("");
    setDonorForm((previousForm) => ({
      ...previousForm,
      [name]: name === "isHealthy" && value === "yes" ? value : value,
      ...(name === "isHealthy" && value === "yes" ? { healthReason: "" } : {}),
    }));
  };

  const handleDonorSubmit = async (event) => {
    event.preventDefault();

    if (!donorForm.weight || !donorForm.isHealthy || !donorForm.availability || !donorForm.preferredDistance) {
      setDonorError("Please fill weight, health status, availability, and preferred distance.");
      return;
    }

    if (donorForm.isHealthy === "no" && !donorForm.healthReason.trim()) {
      setDonorError("Please add a health reason.");
      return;
    }

    try {
      setIsSavingDonor(true);
      setDonorError("");
      const data = await updateCurrentDonor({
        weight: donorForm.weight,
        isHealthy: donorForm.isHealthy,
        healthReason: donorForm.healthReason,
        availability: donorForm.availability,
        preferredDistance: donorForm.preferredDistance,
      });
      setDonorInfo(data.donor);
      setIsEditingDonor(false);
    } catch (error) {
      setDonorError(error.message || "Unable to update donor information");
    } finally {
      setIsSavingDonor(false);
    }
  };

  return (
    <div className="space-y-5 py-4">
      {!user?.isDonor && !isBloodBankUser ? <BecomeDonorCta /> : null}

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="bg-zinc-50 px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative size-24 shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.username || "User profile"}
                  className="size-24 rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="grid size-24 place-items-center rounded-full border-4 border-white bg-red-50 text-red-700 shadow-md">
                  {getInitials(user?.username || "User")}
                </div>
              )}

              <button
                type="button"
                aria-label="Change profile photo"
                onClick={handleCameraClick}
                disabled={isUploading}
                className="absolute bottom-1 right-0 grid size-8 cursor-pointer place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-extrabold text-zinc-950">
                {user?.username || "User"}
              </h2>

              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-zinc-600">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{user?.email || "Email not added"}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-700">
                  <UserRound className="size-3.5" />
                  {user?.role || "Regular User"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
                  <CalendarDays className="size-3.5" />
                  Member since {memberSince}
                </span>
              </div>

              {isUploading ? (
                <p className="mt-3 text-xs font-semibold text-zinc-500">
                  Updating profile picture...
                </p>
              ) : null}
              {uploadError ? (
                <p className="mt-3 text-xs font-bold text-red-600">{uploadError}</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={handleProfileSubmit}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
              <UserRound className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-zinc-950">Personal Information</h3>
              <p className="mt-1 text-xs font-semibold text-zinc-500">
                Keep your information up to date for a better experience.
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSavingProfile}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="size-3.5" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="size-3.5" />
                {isSavingProfile ? "Saving" : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEditProfile}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          )}
        </div>

        {profileError ? (
          <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
            {profileError}
          </p>
        ) : null}

        <div className="mt-6 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
          {isEditing ? (
            <>
              <EditableDetail
                icon={UserRound}
                label="Username"
                name="username"
                value={profileForm.username}
                onChange={handleProfileInputChange}
              />
              <EditableDetail
                icon={Phone}
                label="Phone Number"
                name="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={handleProfileInputChange}
              />
              <EditableDetail
                icon={Cake}
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={profileForm.dateOfBirth}
                onChange={handleProfileInputChange}
              />
              <EditableSelect
                icon={Mars}
                label="Gender"
                name="gender"
                value={profileForm.gender}
                onChange={handleProfileInputChange}
              />
              <ReadonlyInput icon={Mail} label="Email" value={user?.email || "Not Added"} />
            </>
          ) : (
            <>
              <Detail icon={UserRound} label="Username" value={user?.username || "Not Added"} />
              <Detail icon={Phone} label="Phone Number" value={user?.phoneNumber || "Not Added"} />
              <Detail icon={Cake} label="Date of Birth" value={formatDate(user?.dateOfBirth)} />
              <Detail icon={Mars} label="Gender" value={user?.gender || "Not Added"} />
              <Detail icon={Mail} label="Email" value={user?.email || "Not Added"} />
            </>
          )}
        </div>
      </form>

      {user?.isDonor ? (
        <DonorInformationCard
          donorInfo={donorInfo}
          donorForm={donorForm}
          error={donorError}
          isEditing={isEditingDonor}
          isLoading={isLoadingDonorInfo}
          isSaving={isSavingDonor}
          onEdit={handleEditDonor}
          onCancel={handleCancelDonorEdit}
          onChange={handleDonorInputChange}
          onSubmit={handleDonorSubmit}
        />
      ) : null}

      <SecurityCenterCard
        hasPassword={hasPassword}
        passwordForm={passwordForm}
        error={passwordError}
        success={passwordSuccess}
        isEditing={isEditingPassword}
        isSaving={isSavingPassword}
        onEdit={() => {
          setPasswordError("");
          setPasswordSuccess("");
          setIsEditingPassword(true);
        }}
        onCancel={handleCancelPasswordEdit}
        onChange={handlePasswordInputChange}
        onSubmit={handlePasswordSubmit}
      />

      <DangerZoneCard
        confirmText={deleteConfirmText}
        error={deleteError}
        isConfirming={isConfirmingDelete}
        isDeleting={isDeletingAccount}
        onConfirmTextChange={(event) => {
          setDeleteError("");
          setDeleteConfirmText(event.target.value);
        }}
        onStart={() => {
          setDeleteError("");
          setIsConfirmingDelete(true);
        }}
        onCancel={() => {
          setDeleteError("");
          setDeleteConfirmText("");
          setIsConfirmingDelete(false);
        }}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
};

function SecurityCenterCard({
  hasPassword,
  passwordForm,
  error,
  success,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onChange,
  onSubmit,
}) {
  const statusLabel = hasPassword ? "Protected" : "At Risk";
  const description = hasPassword
    ? "Update your login password to keep account access secure."
    : "Your account has no password. Set one to login with email and password.";
  const buttonLabel = hasPassword ? "Change Password" : "Enable Protection";

  return (
    <form
      className={`overflow-hidden rounded-lg border shadow-sm ${
        hasPassword ? "border-emerald-100 bg-emerald-50/50" : "border-red-100 bg-red-50/60"
      }`}
      onSubmit={onSubmit}
    >
      <div
        className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${
          hasPassword
            ? "bg-[linear-gradient(90deg,rgba(236,253,245,0.96),rgba(255,255,255,0.95))]"
            : "bg-[linear-gradient(90deg,rgba(254,242,242,0.98),rgba(255,255,255,0.95))]"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-12 shrink-0 place-items-center rounded-full border shadow-sm ${
              hasPassword
                ? "border-emerald-100 bg-white text-emerald-600"
                : "border-red-100 bg-white text-red-600"
            }`}
          >
            {hasPassword ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-zinc-950">Security Center</h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase ${
                  hasPassword ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                }`}
              >
                {statusLabel}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-zinc-500">{description}</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-xs font-extrabold shadow-sm transition ${
              hasPassword
                ? "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                : "border-red-200 bg-white text-red-700 hover:bg-red-50"
            }`}
          >
            <LockKeyhole className="size-4" />
            {buttonLabel}
          </button>
        ) : null}
      </div>

      {success ? (
        <p className="mx-5 mb-5 rounded-md bg-white px-3 py-2 text-xs font-bold text-emerald-700 sm:mx-6">
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="mx-5 mb-5 rounded-md bg-white px-3 py-2 text-xs font-bold text-red-600 sm:mx-6">
          {error}
        </p>
      ) : null}

      {isEditing ? (
        <div className="border-t border-white/70 bg-white p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {hasPassword ? (
              <PasswordField
                label="Current Password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={onChange}
              />
            ) : null}
            <PasswordField
              label="New Password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={onChange}
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={onChange}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-red-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-3.5" />
              {isSaving ? "Saving" : "Save Password"}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function PasswordField({ label, name, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-zinc-500">{label}</span>
      <input
        type="password"
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

function DangerZoneCard({
  confirmText,
  error,
  isConfirming,
  isDeleting,
  onConfirmTextChange,
  onStart,
  onCancel,
  onDelete,
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-red-100 bg-red-50/70 shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-red-100 bg-white text-red-600 shadow-sm">
            <Trash2 className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-zinc-950">Danger Zone</h3>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Once you delete your account, there is no going back.
            </p>
          </div>
        </div>

        {!isConfirming ? (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-4 text-xs font-extrabold text-red-600 shadow-sm transition hover:bg-red-50"
          >
            <Trash2 className="size-4" />
            Delete Account
          </button>
        ) : null}
      </div>

      {isConfirming ? (
        <div className="border-t border-white/70 bg-white p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block">
              <span className="text-xs font-bold text-zinc-500">Type DELETE to confirm</span>
              <input
                type="text"
                value={confirmText}
                onChange={onConfirmTextChange}
                className="mt-1 h-10 w-full rounded-md border border-red-100 px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="size-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-red-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="size-3.5" />
                {isDeleting ? "Deleting" : "Delete Forever"}
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Detail({ icon: Icon, label, value }) {
  const isMissing = value === "Not Added";

  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-3">
      <Icon className="size-4 text-zinc-500" />
      <div className="min-w-0">
        <p className="text-xs font-bold text-zinc-500">{label}</p>
        <p
          className={`mt-1 truncate text-xs font-extrabold ${
            isMissing ? "text-red-600" : "text-zinc-950"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function EditableDetail({ icon: Icon, label, name, value, onChange, type = "text" }) {
  return (
    <label className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-3">
      <Icon className="size-4 text-zinc-500" />
      <span className="min-w-0">
        <span className="text-xs font-bold text-zinc-500">{label}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
      </span>
    </label>
  );
}

function EditableSelect({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  options = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ],
}) {
  return (
    <label className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-3">
      <Icon className="size-4 text-zinc-500" />
      <span className="min-w-0">
        <span className="text-xs font-bold text-zinc-500">{label}</span>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function ReadonlyInput({ icon: Icon, label, value }) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-3">
      <Icon className="size-4 text-zinc-500" />
      <div className="min-w-0">
        <p className="text-xs font-bold text-zinc-500">{label}</p>
        <input
          type="email"
          value={value}
          disabled
          className="mt-1 h-10 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-zinc-500"
        />
        <p className="mt-1 text-[11px] font-bold text-zinc-400">Email cannot be changed</p>
      </div>
    </div>
  );
}

function DonorInformationCard({
  donorInfo,
  donorForm,
  error,
  isEditing,
  isLoading,
  isSaving,
  onEdit,
  onCancel,
  onChange,
  onSubmit,
}) {
  return (
    <form className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={onSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <Save className="size-5" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-950">Donor Information</h3>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Manage your donor health and availability details.
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-3.5" />
              {isSaving ? "Saving" : "Save"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            disabled={isLoading || !donorInfo}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-extrabold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-6 text-xs font-bold text-zinc-500">Loading donor information...</p>
      ) : (
        <div className="mt-6 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
          {isEditing ? (
            <>
              <EditableDetail
                icon={Save}
                label="Weight"
                name="weight"
                type="number"
                value={donorForm.weight}
                onChange={onChange}
              />
              <EditableSelect
                icon={UserRound}
                label="Healthy"
                name="isHealthy"
                value={donorForm.isHealthy}
                onChange={onChange}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
              {donorForm.isHealthy === "no" ? (
                <EditableDetail
                  icon={Pencil}
                  label="Health Reason"
                  name="healthReason"
                  value={donorForm.healthReason}
                  onChange={onChange}
                />
              ) : null}
              <EditableSelect
                icon={CalendarDays}
                label="Availability"
                name="availability"
                value={donorForm.availability}
                onChange={onChange}
                options={[
                  { value: "anytime", label: "Anytime" },
                  { value: "emergency", label: "Emergency Only" },
                  { value: "unavailable", label: "Unavailable" },
                ]}
              />
              <EditableSelect
                icon={Phone}
                label="Preferred Distance"
                name="preferredDistance"
                value={donorForm.preferredDistance}
                onChange={onChange}
                options={[
                  { value: "5", label: "5 km" },
                  { value: "10", label: "10 km" },
                  { value: "20", label: "20 km" },
                  { value: "50", label: "50 km" },
                ]}
              />
            </>
          ) : (
            <>
              <Detail icon={Save} label="Weight" value={donorInfo?.weight ? `${donorInfo.weight} kg` : "Not Added"} />
              <Detail icon={UserRound} label="Healthy" value={formatHealth(donorInfo?.isHealthy)} />
              {donorInfo?.isHealthy === "no" ? (
                <Detail icon={Pencil} label="Health Reason" value={donorInfo?.healthReason || "Not Added"} />
              ) : null}
              <Detail icon={CalendarDays} label="Availability" value={formatAvailability(donorInfo?.availability)} />
              <Detail icon={Phone} label="Preferred Distance" value={donorInfo?.preferredDistance ? `${donorInfo.preferredDistance} km` : "Not Added"} />
            </>
          )}
        </div>
      )}
    </form>
  );
}
