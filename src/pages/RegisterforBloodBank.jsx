import { useEffect, useState } from "react";
import {ArrowRight,Building2,CheckCircle2,Clock3,Eye,EyeOff,FileText,Lock,Mail,MapPin,Phone,Search,ShieldCheck,User} from "lucide-react";
import LocationPicker from "../components/LocationPicker.jsx";
import { axiosWithoutCreds } from "../api/axiosInstances.js";
import { registerBloodBankApi } from "../api/bloodBankApi.js";
import bloodBankRegistrationImage from "../assets/blood_bank_registeration.png";

function Field({
  label,
  required,
  icon: Icon,
  type = "text",
  placeholder,
  helper,
  children,
  inputProps = {},
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-slate-800">
        {label} {required && <span className="text-rose-600">*</span>}
      </span>
      {children || (
        <div className="flex h-9 items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-slate-400" />}
          <input
            type={type}
            placeholder={placeholder}
            {...inputProps}
            className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
          />
          {type === "password" && <Eye className="h-4 w-4 shrink-0 text-slate-400" />}
        </div>
      )}
      {helper && <span className="mt-1.5 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

export const BloodbankRegisteration = () => {
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressParts, setAddressParts] = useState({
    city: "",
    district: "",
    state: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [licenseDocument, setLicenseDocument] = useState(null);
  const [licenseDocumentName, setLicenseDocumentName] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState("");
  const [location, setLocation] = useState({
    type: "Point",
    coordinates: [],
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSelectedLocation = location.coordinates.length === 2;
  const showPasswordLengthError = password.length > 0 && password.length < 8;
  const showConfirmPasswordError =
    confirmPassword.length > 0 && password !== confirmPassword;
  const selectedLongitude = hasSelectedLocation ? location.coordinates[0] : null;
  const selectedLatitude = hasSelectedLocation ? location.coordinates[1] : null;
  const initialPickerPosition = hasSelectedLocation
    ? {
        latitude: selectedLatitude,
        longitude: selectedLongitude,
      }
    : undefined;

  useEffect(() => {
    const searchText = address.trim();

    if (searchText.length < 3) {
      setAddressSuggestions([]);
      setAddressSearchError("");
      setIsSearchingAddress(false);
      return;
    }

    if (searchText === selectedAddress) {
      setAddressSuggestions([]);
      setAddressSearchError("");
      setIsSearchingAddress(false);
      return;
    }

    let isActive = true;

    const debounceTimer = window.setTimeout(async () => {
      setIsSearchingAddress(true);
      setAddressSearchError("");

      try {
        const response = await axiosWithoutCreds.get("/api/geocoding/autocomplete", {
          params: { q: searchText },
        });

        if (isActive) {
          setAddressSuggestions(response?.results || []);
        }
      } catch (error) {
        if (isActive) {
          setAddressSuggestions([]);
          setAddressSearchError(error.message || "Unable to search address.");
        }
      } finally {
        if (isActive) {
          setIsSearchingAddress(false);
        }
      }
    }, 450);

    return () => {
      isActive = false;
      window.clearTimeout(debounceTimer);
    };
  }, [address, selectedAddress]);

  const handleLocationConfirm = ({ latitude, longitude }) => {
    setLocation({
      type: "Point",
      coordinates: [longitude, latitude],
    });
    setLocationError("");
    setShowLocationPicker(false);
  };

  const handleAddressSuggestionSelect = (suggestion) => {
    setAddress(suggestion.formatted);
    setSelectedAddress(suggestion.formatted);
    setAddressParts({
      city: suggestion.city || "",
      district: suggestion.district || "",
      state: suggestion.state || "",
    });
    setAddressSuggestions([]);
    setAddressSearchError("");

    if (typeof suggestion.latitude === "number" && typeof suggestion.longitude === "number") {
      setLocation({
        type: "Point",
        coordinates: [suggestion.longitude, suggestion.latitude],
      });
      setLocationError("");
    }
  };

  const resetFormFields = (form) => {
    form.reset();
    setAddress("");
    setSelectedAddress("");
    setAddressParts({
      city: "",
      district: "",
      state: "",
    });
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setLicenseDocument(null);
    setLicenseDocumentName("");
    setAddressSuggestions([]);
    setAddressSearchError("");
    setLocation({
      type: "Point",
      coordinates: [],
    });
    setLocationError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitMessage("");

    if (showPasswordLengthError) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    if (!address.trim()) {
      setFormError("Please enter the blood bank address.");
      return;
    }

    if (!password || password !== confirmPassword) {
      setFormError("Password and confirm password must match.");
      return;
    }

    if (!hasSelectedLocation) {
      setLocationError("Please select the exact location of your blood bank.");
      setFormError("Please select the exact location of your blood bank.");
      return;
    }

    if (!licenseDocument) {
      setFormError("Please upload the blood bank license document.");
      return;
    }

    const form = event.currentTarget;
    const bloodBankData = new FormData(form);

    bloodBankData.set("password", password);
    bloodBankData.set("confirmPassword", confirmPassword);
    bloodBankData.set("address", address.trim());
    bloodBankData.set("city", addressParts.city);
    bloodBankData.set("district", addressParts.district);
    bloodBankData.set("state", addressParts.state);
    bloodBankData.set("location", JSON.stringify(location));
    bloodBankData.set("isOpen24Hours", form.isOpen24Hours.checked ? "true" : "false");

    try {
      setIsSubmitting(true);
      const response = await registerBloodBankApi(bloodBankData);
      setSubmitMessage(
        response?.message ||
          "Blood Bank registration submitted successfully. Verification may take up to 24 hours."
      );
      resetFormFields(form);
    } catch (error) {
      setFormError(error.message || "Unable to register blood bank.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#fff7f8] p-0 text-slate-950">
      <div className="h-full w-full bg-white shadow-[0_24px_80px_rgba(225,29,72,0.12)] lg:pl-[380px] xl:pl-[400px]">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-[380px] overflow-hidden bg-[#fff5f6] lg:block xl:w-[400px]">
          <img
            src={bloodBankRegistrationImage}
            alt="BloodConnect blood bank registration illustration"
            className="h-full w-full object-cover object-left-top"
          />
        </aside>

        <section className="h-full min-w-0 overflow-y-auto bg-white py-2 pl-2 pr-0 sm:pl-3 lg:pl-4">
          <div className="mx-auto max-w-none">
            <div className="mb-6 lg:hidden">
              <img
                src={bloodBankRegistrationImage}
                alt="BloodConnect blood bank registration illustration"
                className="max-h-72 w-full rounded-xl bg-[#fff5f6] object-contain object-top"
              />
            </div>

            <form onSubmit={handleSubmit} className="min-h-[calc(100vh-1rem)] rounded-xl rounded-r-none border border-r-0 border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-950">Blood Bank Registration</h1>
              
                </div>
               
              </div>

              <section className="space-y-2.5">
                <h2 className="text-sm font-bold text-slate-950">Account Details</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Email Address" required icon={Mail} type="email" placeholder="Enter email address" inputProps={{ name: "email", required: true }} />
                  <Field
                    label="Password"
                    required
                    helper={showPasswordLengthError ? "Password must be at least 8 characters long" : ""}
                  >
                    <div className={`flex h-9 items-center gap-2.5 rounded-md border bg-white px-3 shadow-sm transition focus-within:ring-4 ${
                      showPasswordLengthError
                        ? "border-rose-400 focus-within:ring-rose-100"
                        : "border-slate-200 focus-within:border-rose-400 focus-within:ring-rose-100"
                    }`}>
                      <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter password"
                        className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-400 transition hover:text-slate-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field
                    label="Confirm Password"
                    required
                    helper={showConfirmPasswordError ? "Password and confirm password do not match" : ""}
                  >
                    <div className={`flex h-9 items-center gap-2.5 rounded-md border bg-white px-3 shadow-sm transition focus-within:ring-4 ${
                      showConfirmPasswordError
                        ? "border-rose-400 focus-within:ring-rose-100"
                        : "border-slate-200 focus-within:border-rose-400 focus-within:ring-rose-100"
                    }`}>
                      <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Confirm password"
                        className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((current) => !current)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-400 transition hover:text-slate-700"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="text-sm font-bold text-slate-950">Blood Bank Information</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Blood Bank Name" required icon={Building2} placeholder="Enter blood bank name" inputProps={{ name: "bloodBankName", required: true }} />
                  <Field label="License Number" required icon={ShieldCheck} placeholder="Enter license number" inputProps={{ name: "licenseNumber", required: true }} />
                  <Field label="Contact Person Name" required icon={User} placeholder="Enter contact person name" inputProps={{ name: "contactPersonName", required: true }} />
                  <Field label="Phone Number" required icon={Phone} type="tel" placeholder="Enter phone number" inputProps={{ name: "phoneNumber", required: true }} />
                
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="text-sm font-bold text-slate-950">Address & Location</h2>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                  
                   
                    <div className="md:col-span-3">
                      <Field label="Blood Bank Address" required>
                        <div className="relative">
                          <div className="flex h-9 items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                            <Search className="h-4 w-4 shrink-0 text-slate-400" />
                            <input
                              type="text"
                              name="address"
                              required
                              value={address}
                              onChange={(event) => {
                                setAddress(event.target.value);
                                setSelectedAddress("");
                                setAddressParts({
                                  city: "",
                                  district: "",
                                  state: "",
                                });
                              }}
                              placeholder="Search blood bank name or address..."
                              className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                              autoComplete="off"
                            />
                          </div>

                          {(isSearchingAddress || addressSearchError || addressSuggestions.length > 0) && (
                            <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-md border border-slate-200 bg-white text-xs shadow-lg">
                              {isSearchingAddress && (
                                <div className="px-3 py-2 font-semibold text-slate-500">Searching...</div>
                              )}

                              {!isSearchingAddress && addressSearchError && (
                                <div className="px-3 py-2 font-semibold text-rose-600">{addressSearchError}</div>
                              )}

                              {!isSearchingAddress &&
                                !addressSearchError &&
                                addressSuggestions.map((suggestion) => (
                                  <button
                                    key={`${suggestion.formatted}-${suggestion.latitude}-${suggestion.longitude}`}
                                    type="button"
                                    onClick={() => handleAddressSuggestionSelect(suggestion)}
                                    className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2 text-left text-slate-700 transition last:border-b-0 hover:bg-rose-50 hover:text-rose-700"
                                  >
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                                    <span className="min-w-0 leading-5">{suggestion.formatted}</span>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      </Field>
                    </div>
                  

                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-3">
                    <h3 className="text-xs font-bold text-slate-950">Exact Blood Bank Location <span className="text-rose-600">*</span></h3>
                    {hasSelectedLocation ? (
                      <div className="mt-1 space-y-1 text-xs">
                        <p className="font-semibold text-emerald-700">Location selected</p>
                        <p className="line-clamp-2 text-slate-600">
                          {address || "Exact blood bank location confirmed."}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Pin the exact location of your blood bank.</p>
                    )}
                    
                    <button type="button" onClick={() => setShowLocationPicker(true)} className="flex mt-3 cursor-pointer h-8 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700">
                      <MapPin className="h-4 w-4" />
                      {hasSelectedLocation ? "Change Location" : "Pick on Map"}
                    </button>
                    {locationError && <p className="mt-2 text-xs font-semibold text-rose-600">{locationError}</p>}
                  </div>
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="text-sm font-bold text-slate-950">Working Hours</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Opening Time" required icon={Clock3} type="time" inputProps={{ name: "openingTime", required: true }} />
                  <Field label="Closing Time" required icon={Clock3} type="time" inputProps={{ name: "closingTime", required: true }} />
                  <label className="flex min-h-11 items-center gap-3 pt-6">
                    <input name="isOpen24Hours" type="checkbox" className="h-5 w-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500" />
                    <span>
                      <span className="block text-xs font-bold text-slate-800">Open 24 Hours</span>
                      <span className="block text-xs text-slate-500">Optional - check if your blood bank is open all day</span>
                    </span>
                  </label>
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="text-sm font-bold text-slate-950">Documents</h2>
                <div className="grid gap-3 md:max-w-xl md:grid-cols-1">
                  <Field label="License Document" required>
                    <label className="flex h-9 cursor-pointer items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 text-xs shadow-sm transition hover:border-rose-200 hover:bg-rose-50 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="shrink-0 rounded bg-slate-100 px-2 py-1 font-bold text-slate-700">
                        Choose File
                      </span>
                      <span className="min-w-0 flex-1 truncate text-slate-500">
                        {licenseDocumentName || "No file chosen"}
                      </span>
                      <input
                        type="file"
                        name="licenseDocument"
                        required
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setLicenseDocument(file);
                          setLicenseDocumentName(file?.name || "");
                        }}
                      />
                    </label>
                  </Field>
                </div>
              </section>

              <div className="mt-4 border-t border-slate-100 pt-3">
                {submitMessage && (
                  <div className="mb-3 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Registration submitted</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">
                        Your blood bank account is pending admin approval. Verification may take up to 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-h-5 min-w-0 text-xs font-semibold">
                    {formError && <p className="text-rose-600">{formError}</p>}
                  </div>
                <button type="submit" disabled={isSubmitting || Boolean(submitMessage)} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-rose-600 px-8 text-xs font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300">
                  {isSubmitting ? "Registering..." : "Register Blood Bank"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
      {showLocationPicker && (
        <LocationPicker
          initialPosition={initialPickerPosition}
          onConfirm={handleLocationConfirm}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </main>
  );
};
