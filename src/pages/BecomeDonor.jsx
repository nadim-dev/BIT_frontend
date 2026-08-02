import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Headphones,
  Heart,
  HeartHandshake,
  MapPinned,
  Mail,
  MapPin,
  PauseCircle,
  ShieldCheck,
  UserRound,
  HeartPulse,
  Siren,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { createDonor, updateDonorLocation } from "../api/donorApi";
import { getDashboardPath } from "../utils/dashboardRoutes";

const steps = [
  {
    id: 1,
    title: "Personal Details",
    description: "Basic information about you",
  },
  {
    id: 2,
    title: "Health Information",
    description: "Medical history & eligibility",
  },
  {
    id: 3,
    title: "Availability & Preferences",
    description: "When & how you want to donate",
  },
];

const donorReasons = [
  {
    icon: Heart,
    text: "Save up to 3 lives with a single donation",
  },
  {
    icon: Bell,
    text: "Get notified when someone needs your blood",
  },
  {
    icon: HeartHandshake,
    text: "Be a hero in your community",
  },
  {
    icon: CircleUserRound,
    text: "You can pause anytime you want",
  },
];

export const BecomeDonor = () => {
  const { currentUser, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [formError, setFormError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState(() => (
    navigator.geolocation ? "detecting" : "unsupported"
  ));
  
  const [donorForm, setDonorForm] = useState({
    bloodGroup: currentUser?.bloodGroup || "",
    dateOfBirth: "",
    gender: "",
    weight: "",
    phoneNumber: currentUser?.phoneNumber || currentUser?.phone || "",
    location: currentUser?.short_address || "Bhiwandi, Maharashtra",
    donatedBefore: "",
    lastDonationDate: "",
    isHealthy: "yes",
    healthReason: "",
    eligibilityConfirmed: false,
    availability: "anytime",
    maxTravelDistance: "10",
    notifyNearbyRequests: true,
    notifyEmergencyRequests: true,
  });

  const userName = currentUser?.username || "User";
  const userEmail = currentUser?.email || "";
  const isDonorRegistered = Boolean(submitMessage);
  const completedSteps = isDonorRegistered ? 3 : activeStep - 1;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);
  const progressWidthClass = completedSteps === 0
    ? "w-0"
    : completedSteps === 1
      ? "w-1/3"
      : completedSteps === 2
        ? "w-2/3"
        : "w-full";
  const isStepCompleted = (stepId) => isDonorRegistered || stepId < activeStep;
  const isCurrentStep = (stepId) => !isDonorRegistered && stepId === activeStep;

  const updateCoordinates = useCallback(async (position) => {
    const coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };


    try {
      const response = await updateDonorLocation(coordinates);
      const shortAddress = response?.short_address;

      setDonorForm((previousForm) => ({
        ...previousForm,
        location: shortAddress || previousForm.location,
      }));

      setLocationStatus("detected");
    } catch (error) {
      setLocationStatus("address_failed");
      setFormError(error.response?.data?.message || "Coordinates detected, but address could not be updated.");
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }



    navigator.geolocation.getCurrentPosition(
      updateCoordinates,
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, [updateCoordinates]);

  useEffect(() => {
    if (!submitMessage) {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      navigate(getDashboardPath(currentUser?.role), { replace: true });
    }, 2500);

    return () => window.clearTimeout(redirectTimer);
  }, [currentUser?.role, navigate, submitMessage]);
  

  const isPersonalDetailsComplete = () => (
    Boolean(userName) &&
    Boolean(userEmail) &&
    Boolean(donorForm.bloodGroup) &&
    Boolean(donorForm.dateOfBirth) &&
    Boolean(donorForm.gender) &&
    Boolean(donorForm.weight) &&
    Boolean(donorForm.phoneNumber) &&
    Boolean(donorForm.location)
  );

  const isHealthInformationComplete = () => (
    Boolean(donorForm.donatedBefore) &&
    (donorForm.donatedBefore !== "yes" || Boolean(donorForm.lastDonationDate)) &&
    Boolean(donorForm.isHealthy) &&
    (donorForm.isHealthy !== "no" || Boolean(donorForm.healthReason.trim())) &&
    donorForm.eligibilityConfirmed
  );

  const isAvailabilityComplete = () => (
    Boolean(donorForm.availability) &&
    Boolean(donorForm.maxTravelDistance) &&
    (donorForm.notifyNearbyRequests || donorForm.notifyEmergencyRequests)
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormError("");
    setSubmitMessage("");

    setDonorForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleGenderChange = (gender) => {
    setFormError("");
    setSubmitMessage("");
    setDonorForm((previousForm) => ({
      ...previousForm,
      gender,
    }));
  };

  const handleDonationHistoryChange = (donatedBefore) => {
    setFormError("");
    setSubmitMessage("");
    setDonorForm((previousForm) => ({
      ...previousForm,
      donatedBefore,
      lastDonationDate: donatedBefore === "yes" ? previousForm.lastDonationDate : "",
    }));
  };

  const handleHealthStatusChange = (isHealthy) => {
    setFormError("");
    setSubmitMessage("");
    setDonorForm((previousForm) => ({
      ...previousForm,
      isHealthy,
      healthReason: isHealthy === "no" ? previousForm.healthReason : "",
    }));
  };

  const handlePersonalDetailsSubmit = (event) => {
    event.preventDefault();

    if (!isPersonalDetailsComplete()) {
      setFormError("Please complete all personal details before continuing.");
      return;
    }

    setFormError("");
    setActiveStep(2);
  };

  const handleHealthInformationSubmit = (event) => {
    event.preventDefault();

    if (!isHealthInformationComplete()) {
      setFormError("Please complete the health information and confirm eligibility.");
      return;
    }

    setFormError("");
    setActiveStep(3);
  };

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setFormError("");

    setDonorForm((previousForm) => ({
      ...previousForm,
      [name]: checked,
    }));
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      return;
    }

    setFormError("");
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      updateCoordinates,
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isPersonalDetailsComplete()) {
      setFormError("Please complete all personal details before submitting.");
      setActiveStep(1);
      return;
    }

    if (!isHealthInformationComplete()) {
      setFormError("Please complete all health information before submitting.");
      setActiveStep(2);
      return;
    }

    if (!isAvailabilityComplete()) {
      setFormError("Please complete availability preferences before submitting.");
      return;
    }

    try {
      setFormError("");
      setSubmitMessage("");
      setIsSubmitting(true);
      await createDonor({
        phoneNumber: donorForm.phoneNumber,
        gender: donorForm.gender,
        dateOfBirth: donorForm.dateOfBirth,
        location: donorForm.location,
        bloodGroup: donorForm.bloodGroup,
        weight: donorForm.weight,
        hasDonatedBefore: donorForm.donatedBefore,
        lastDonationDate: donorForm.lastDonationDate,
        isHealthy: donorForm.isHealthy,
        healthReason: donorForm.healthReason,
        eligibilityConfirmed: donorForm.eligibilityConfirmed,
        availability: donorForm.availability,
        preferredDistance: donorForm.maxTravelDistance,
        notificationPreferences: {
          nearbyRequests: donorForm.notifyNearbyRequests,
          emergencyRequests: donorForm.notifyEmergencyRequests,
        },
      });
      await fetchCurrentUser();
      setSubmitMessage("You are now registered as a blood donor.");
    } catch (error) {
      setFormError(error.message || "Unable to create donor profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-2">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mx-auto mb-6 grid max-w-4xl grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-3">
            {steps.map((step, index) => (
              <Fragment key={step.id}>
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full border text-base font-extrabold shadow-sm ${
                      isStepCompleted(step.id)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : isCurrentStep(step.id)
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-zinc-300 bg-white text-zinc-700"
                    }`}
                  >
                    {isStepCompleted(step.id) ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                  </div>
                  <p className={`mt-3 text-xs font-extrabold ${isStepCompleted(step.id) ? "text-emerald-700" : isCurrentStep(step.id) ? "text-red-600" : "text-zinc-600"}`}>
                    {step.title}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-zinc-500">
                    {isStepCompleted(step.id) ? "Completed" : isCurrentStep(step.id) ? "Current Step" : "Upcoming"}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mt-5 h-px w-full ${isStepCompleted(step.id) ? "bg-emerald-200" : "bg-zinc-300"}`} />
                )}
              </Fragment>
            ))}
          </div>

          {activeStep === 1 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-zinc-950">
                  Personal Details
                </h1>
                <p className="mt-2 text-xs font-semibold text-zinc-500">
                  Please provide some basic information
                </p>
              </div>
              <span className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-600">
                Step 1 of 3
              </span>
            </div>

            {formError && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                {formError}
              </p>
            )}

            <form className="space-y-6" onSubmit={handlePersonalDetailsSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <UserRound className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">
                      Full Name
                    </p>
                    <p className="mt-1 text-xs font-bold text-zinc-800">
                      {userName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-500">
                      Email Address
                    </p>
                    <p className="mt-1 text-xs font-bold text-zinc-800">
                      {userEmail || "No email found"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.3fr]">
                <label className="block">
                  <span className="text-xs font-extrabold text-zinc-700">
                    Blood Group <span className="text-red-600">*</span>
                  </span>
                  <div className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-500">
                    <DropletIcon />
                    <select
                      name="bloodGroup"
                      value={donorForm.bloodGroup}
                      onChange={handleInputChange}
                      className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-zinc-700 outline-none"
                      required
                    >
                      <option value="">Select your blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-extrabold text-zinc-700">
                    Date of Birth <span className="text-red-600">*</span>
                  </span>
                  <div className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-semibold text-zinc-500">
                    <CalendarDays className="h-4 w-4" />
                    <input
                      name="dateOfBirth"
                      type="date"
                      value={donorForm.dateOfBirth}
                      onChange={handleInputChange}
                      className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-zinc-700 outline-none"
                      required
                    />
                  </div>
                </label>

                <div>
                  <p className="text-xs font-extrabold text-zinc-700">
                    Gender <span className="text-red-600">*</span>
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        className={`flex h-11 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-bold ${
                          donorForm.gender === gender
                            ? "border-red-500 bg-red-50 text-zinc-900"
                            : "border-zinc-200 bg-white text-zinc-700"
                        }`}
                        onClick={() => handleGenderChange(gender)}
                      >
                        <UserRound className={`h-3.5 w-3.5 ${donorForm.gender === gender ? "text-red-600" : "text-zinc-500"}`} />
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.2fr_1.45fr]">
                <label className="block">
                  <span className="text-xs font-extrabold text-zinc-700">
                    Weight (in kg) <span className="text-red-600">*</span>
                  </span>
                  <div className="mt-2 flex h-11 items-center rounded-lg border border-zinc-200 px-3">
                    <input
                      name="weight"
                      type="number"
                      min="1"
                      value={donorForm.weight}
                      onChange={handleInputChange}
                      className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-zinc-700 outline-none placeholder:text-zinc-400"
                      placeholder="Enter weight"
                      required
                    />
                    <span className="text-xs font-bold text-zinc-500">kg</span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-extrabold text-zinc-700">
                    Phone Number <span className="text-red-600">*</span>
                  </span>
                  <div className="mt-2 flex h-11 overflow-hidden rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700">
                    <div className="flex items-center gap-2 border-r border-zinc-200 px-3">
                      <span>IN</span>
                      <span>+91</span>
                    </div>
                    <input
                      name="phoneNumber"
                      type="tel"
                      value={donorForm.phoneNumber}
                      onChange={handleInputChange}
                      className="min-w-0 flex-1 px-3 outline-none"
                      placeholder="98765 43210"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-extrabold text-zinc-700">
                    Current Location
                  </span>
                  <div className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-bold text-zinc-700">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <input
                      name="location"
                      value={donorForm.location}
                      onChange={handleInputChange}
                      className="min-w-0 flex-1 bg-transparent text-xs font-bold text-zinc-700 outline-none placeholder:text-zinc-400"
                      placeholder="Enter current location"
                      required
                    />
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs font-bold text-green-600">
                    {locationStatus === "detected" && (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Location saved
                      </>
                    )}
                    {locationStatus === "detecting" && "Detecting your location..."}
                    {locationStatus === "address_failed" && "Location detected. Please confirm your area."}
                    {locationStatus === "unsupported" && "Browser location is not supported"}
                    {locationStatus === "denied" && (
                      <>
                        Location permission needed
                        <button
                          type="button"
                          onClick={detectCurrentLocation}
                          className="text-red-600 underline"
                        >
                          Retry
                        </button>
                      </>
                    )}
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-red-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-zinc-800">
                    Your information is safe with us
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-600">
                    We never share your personal details without your permission.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-5">
                <button
                  type="button"
                  className="h-11 rounded-lg border border-zinc-200 px-6 text-xs font-extrabold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-7 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
          )}

          {activeStep === 2 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-red-600" />
                <h1 className="text-xl font-extrabold text-zinc-950">
                  Health Information
                </h1>
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-500">
                Answer a few simple questions. This information helps maintain donor safety.
              </p>
            </div>

            {formError && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                {formError}
              </p>
            )}

            <form className="space-y-6" onSubmit={handleHealthInformationSubmit}>
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-extrabold text-zinc-700">
                    Have you donated blood before?
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {[
                      ["never", "Never Donated"],
                      ["yes", "Yes, I Have"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleDonationHistoryChange(value)}
                        className={`flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-extrabold ${
                          donorForm.donatedBefore === value
                            ? "border-red-500 bg-red-50 text-red-600"
                            : "border-zinc-200 bg-white text-zinc-500"
                        }`}
                      >
                        <DropletIcon />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {donorForm.donatedBefore === "yes" && (
                  <label className="block">
                    <span className="text-xs font-extrabold text-zinc-700">
                      Last Blood Donation Date <span className="text-red-600">*</span>
                    </span>
                    <div className="mt-2 flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3">
                      <input
                        name="lastDonationDate"
                        type="date"
                        value={donorForm.lastDonationDate}
                        onChange={handleInputChange}
                        className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-zinc-700 outline-none"
                        required
                      />
                      <CalendarDays className="h-4 w-4 text-zinc-500" />
                    </div>
                  </label>
                )}
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-extrabold text-zinc-700">
                    Are you currently feeling healthy?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-8">
                    {[
                      ["yes", "Yes, I am healthy"],
                      ["no", "No, not right now"],
                    ].map(([value, label]) => (
                      <label key={value} className="flex cursor-pointer items-center gap-2 text-xs font-extrabold text-zinc-700">
                        <input
                          type="radio"
                          name="isHealthy"
                          value={value}
                          checked={donorForm.isHealthy === value}
                          onChange={() => handleHealthStatusChange(value)}
                          className="accent-red-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {donorForm.isHealthy === "no" && (
                  <label className="block">
                    <span className="text-xs font-extrabold text-zinc-700">
                      Reason <span className="text-red-600">*</span>
                    </span>
                    <div className="mt-2 rounded-lg border border-zinc-200 px-3 py-3">
                      <textarea
                        name="healthReason"
                        value={donorForm.healthReason}
                        onChange={handleInputChange}
                        maxLength={150}
                        rows={3}
                        className="w-full resize-none bg-transparent text-xs font-semibold text-zinc-700 outline-none placeholder:text-zinc-400"
                        placeholder="Briefly tell us why..."
                        required
                      />
                      <p className="text-right text-[11px] font-bold text-zinc-400">
                        {donorForm.healthReason.length}/150
                      </p>
                    </div>
                  </label>
                )}
              </div>

              <label className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <input
                  type="checkbox"
                  name="eligibilityConfirmed"
                  checked={donorForm.eligibilityConfirmed}
                  onChange={(event) => {
                    setFormError("");
                    setDonorForm((previousForm) => ({
                      ...previousForm,
                      eligibilityConfirmed: event.target.checked,
                    }));
                  }}
                  className="accent-red-600"
                />
                <span>
                  <span className="block text-xs font-extrabold text-zinc-800">
                    Eligibility Confirmation
                  </span>
                  <span className="mt-1 block text-xs font-semibold text-zinc-600">
                    I confirm that I meet the basic eligibility requirements for donating blood according to my country's donation guidelines.
                  </span>
                </span>
              </label>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-5">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-6 text-xs font-extrabold text-zinc-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-7 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
          )}

          {activeStep === 3 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-red-600" />
                <h1 className="text-xl font-extrabold text-zinc-950">
                  Availability & Preferences
                </h1>
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-500">
                Choose when and how you'd like to help patients in need.
              </p>
            </div>

            {formError && (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                {formError}
              </p>
            )}
            {submitMessage ? (
              <RegisteredDonorSuccess
                name={userName}
                bloodGroup={donorForm.bloodGroup}
                location={donorForm.location}
                availability={donorForm.availability}
              />
            ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <p className="text-xs font-extrabold text-zinc-700">
                    Donation Availability
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        value: "anytime",
                        title: "Available Anytime",
                        note: "I'm open to all requests",
                        icon: Heart,
                      },
                      {
                        value: "emergency",
                        title: "Emergency Only",
                        note: "Only urgent cases",
                        icon: Siren,
                      },
                      {
                        value: "unavailable",
                        title: "Temporarily Unavailable",
                        note: "Not available right now",
                        icon: PauseCircle,
                      },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = donorForm.availability === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormError("");
                            setDonorForm((previousForm) => ({
                              ...previousForm,
                              availability: option.value,
                            }));
                          }}
                          className={`rounded-lg border px-3 py-3 text-left transition ${
                            isSelected
                              ? "border-red-500 bg-red-50 text-red-600"
                              : "border-zinc-200 bg-white text-zinc-600 hover:border-red-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-red-600" : "bg-zinc-300"}`} />
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="mt-2 text-xs font-extrabold">
                            {option.title}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold">
                            {option.note}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-extrabold text-zinc-700">
                    Maximum Travel Distance
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {["5", "10", "20", "50"].map((distance) => {
                      const isSelected = donorForm.maxTravelDistance === distance;

                      return (
                        <button
                          key={distance}
                          type="button"
                          onClick={() => {
                            setFormError("");
                            setDonorForm((previousForm) => ({
                              ...previousForm,
                              maxTravelDistance: distance,
                            }));
                          }}
                          className={`h-10 rounded-lg border text-xs font-extrabold ${
                            isSelected
                              ? "border-red-500 bg-red-50 text-red-600"
                              : "border-zinc-200 bg-white text-zinc-600"
                          }`}
                        >
                          {distance} km
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-zinc-500">
                    You'll receive requests only within your preferred distance.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
                <div>
                  <p className="text-xs font-extrabold text-zinc-700">
                    Notification Preferences
                  </p>
                  <div className="mt-3 space-y-3">
                    {[
                      ["notifyNearbyRequests", "Nearby Blood Requests"],
                      ["notifyEmergencyRequests", "Emergency Requests"],
                    ].map(([name, label]) => (
                      <label key={name} className="flex cursor-pointer items-center gap-3 text-xs font-extrabold text-zinc-700">
                        <input
                          type="checkbox"
                          name={name}
                          checked={donorForm[name]}
                          onChange={handleNotificationChange}
                          className="accent-red-600"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-zinc-500">
                    We'll notify you when someone needs your help.
                  </p>
                </div>

                <div className="flex gap-3 rounded-lg bg-blue-50 px-4 py-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-blue-600">
                    <MapPinned className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-zinc-800">
                      Your exact address is never shared.
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-600">
                      Patients only see your approximate area after you accept a request.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 pt-5">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-200 px-6 text-xs font-extrabold text-zinc-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-7 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  <Heart className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Become a Donor"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
            )}
          </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-600">
                <Heart className="h-5 w-5" />
              </div>
              <h2 className="text-base font-extrabold text-zinc-950">
                Why Become a Donor?
              </h2>
            </div>
            <div className="space-y-5">
              {donorReasons.map((reason) => {
                const Icon = reason.icon;

                return (
                  <div key={reason.text} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-red-600" />
                    <p className="text-xs font-extrabold leading-relaxed text-zinc-700">
                      {reason.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-zinc-950">
              Progress Overview
            </h2>
            <p className="mt-2 text-xs font-semibold text-zinc-500">
              Step {completedSteps} of 3 completed
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                <div className={`h-full rounded-full transition-all ${isDonorRegistered ? "bg-emerald-600" : "bg-red-600"} ${progressWidthClass}`} />
              </div>
              <span className="text-xs font-extrabold text-zinc-700">{progressPercent}%</span>
            </div>

            <div className="mt-5">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`relative flex gap-4 rounded-lg p-3 ${
                    isStepCompleted(step.id) ? "bg-emerald-50" : isCurrentStep(step.id) ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border text-xs font-extrabold ${
                        isStepCompleted(step.id)
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : isCurrentStep(step.id)
                          ? "border-red-600 bg-red-600 text-white"
                          : "border-zinc-300 bg-white text-zinc-500"
                      }`}
                    >
                      {isStepCompleted(step.id) ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                    </span>
                    {step.id < steps.length && (
                      <span className={`h-9 w-px ${isStepCompleted(step.id) ? "bg-emerald-200" : "bg-zinc-200"}`} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className={`text-xs font-extrabold ${isStepCompleted(step.id) ? "text-emerald-700" : isCurrentStep(step.id) ? "text-red-600" : "text-zinc-800"}`}>
                      {step.title}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-zinc-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-zinc-950">
              Need Help?
            </h2>
            <p className="mt-3 max-w-xs text-xs font-semibold leading-relaxed text-zinc-500">
              If you have any questions, our support team is here to help you.
            </p>
            <button
              type="button"
              onClick={()=>navigate("/support")}
              className="cursor-pointer mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-red-500 px-4 text-xs font-extrabold text-red-600"
            >
              <Headphones className="h-4 w-4" />
              Contact Support
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

function RegisteredDonorSuccess({ name, bloodGroup, location, availability }) {
  const availabilityText = {
    anytime: "Available anytime",
    emergency: "Emergency only",
    unavailable: "Temporarily unavailable",
  };

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold text-zinc-950">
            You are registered as a blood donor
          </p>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-600">
            Thank you, {name}. Your donor profile is active and you can now receive matching blood request alerts.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
              <p className="text-[11px] font-extrabold uppercase text-zinc-500">
                Blood Group
              </p>
              <p className="mt-1 text-sm font-extrabold text-red-600">
                {bloodGroup}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
              <p className="text-[11px] font-extrabold uppercase text-zinc-500">
                Location
              </p>
              <p className="mt-1 truncate text-sm font-extrabold text-zinc-800">
                {location}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white px-4 py-3">
              <p className="text-[11px] font-extrabold uppercase text-zinc-500">
                Status
              </p>
              <p className="mt-1 text-sm font-extrabold text-emerald-700">
                {availabilityText[availability] || "Active donor"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DropletIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-zinc-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3.5s5 5.6 5 9.5a5 5 0 0 1-10 0c0-3.9 5-9.5 5-9.5Z" />
    </svg>
  );
}
