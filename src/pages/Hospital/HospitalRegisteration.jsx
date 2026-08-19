import { useEffect, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Eye, EyeOff, FileText, HeartPulse, Lock, Mail, MapPin, Phone, Search, ShieldCheck, UploadCloud, User } from "lucide-react";
import LocationPicker from "../../components/LocationPicker.jsx";
import { axiosWithoutCreds } from "../../api/axiosInstances.js";
import { registerHospitalApi } from "../../api/hospitalApi.js";
import hospitalImage from "../../assets/hospital_image.png";

function Field({ label, required, icon: Icon, type = "text", placeholder, helper, children, inputProps = {} }) {
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
        </div>
      )}
      {helper && <span className="mt-1.5 block text-xs font-semibold text-rose-600">{helper}</span>}
    </label>
  );
}

function ReadOnlyLocationField({ label, value }) {
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-slate-800">{label}</span>
      <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 shadow-sm">
        <span className="truncate">{value || "Select address first"}</span>
      </div>
    </div>
  );
}

function FileField({ fileName, onFileChange }) {
  return (
    <Field label="Registration Certificate" required>
      <label className="flex h-9 cursor-pointer items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 text-xs shadow-sm transition hover:border-rose-200 hover:bg-rose-50 focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
        <UploadCloud className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="shrink-0 rounded bg-slate-100 px-2 py-1 font-bold text-slate-700">Upload</span>
        <span className="min-w-0 flex-1 truncate text-slate-500">{fileName || "JPG, PNG or PDF"}</span>
        <input
          type="file"
          name="registrationDocument"
          required
          accept=".jpg,.jpeg,.png,.pdf"
          className="sr-only"
          onChange={onFileChange}
        />
      </label>
    </Field>
  );
}

export const HospitalRegisteration = () => {
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressParts, setAddressParts] = useState({ city: "", district: "", state: "" });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressSearchError, setAddressSearchError] = useState("");
  const [location, setLocation] = useState({ type: "Point", coordinates: [] });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationDocument, setRegistrationDocument] = useState(null);
  const [registrationDocumentName, setRegistrationDocumentName] = useState("");
  const [formError, setFormError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasSelectedLocation = location.coordinates.length === 2;
  const showPasswordLengthError = password.length > 0 && password.length < 8;
  const showConfirmPasswordError = confirmPassword.length > 0 && password !== confirmPassword;
  const initialPickerPosition = hasSelectedLocation
    ? { latitude: location.coordinates[1], longitude: location.coordinates[0] }
    : undefined;

  useEffect(() => {
    const searchText = address.trim();

    if (searchText.length < 3 || searchText === selectedAddress) {
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
      setLocation({ type: "Point", coordinates: [suggestion.longitude, suggestion.latitude] });
      setLocationError("");
    }
  };

  const handleLocationConfirm = ({ latitude, longitude }) => {
    setLocation({ type: "Point", coordinates: [longitude, latitude] });
    setLocationError("");
    setShowLocationPicker(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitMessage("");

    if (showPasswordLengthError) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    if (!password || password !== confirmPassword) {
      setFormError("Password and confirm password must match.");
      return;
    }

    if (!address.trim() || !hasSelectedLocation) {
      setLocationError("Please select the hospital address and exact location.");
      setFormError("Please select the hospital address and exact location.");
      return;
    }

    if (!addressParts.city || !addressParts.state) {
      setFormError("Please select a valid address that includes city and state.");
      return;
    }

    if (!registrationDocument) {
      setFormError("Please upload the registration certificate.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);
    formData.set("address", address.trim());
    formData.set("city", addressParts.city);
    formData.set("district", addressParts.district);
    formData.set("state", addressParts.state);
    formData.set("location", JSON.stringify(location));

    try {
      setIsSubmitting(true);
      const response = await registerHospitalApi(formData);
      setSubmitMessage(response?.message || "Hospital registration submitted successfully.");
    } catch (error) {
      setFormError(error.status === 404 ? "Hospital registration API is not connected yet." : error.message || "Unable to register hospital.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#fff7f8] p-0 text-slate-950">
      <div className="h-full w-full bg-white shadow-[0_24px_80px_rgba(225,29,72,0.12)] lg:pl-[380px] xl:pl-[400px]">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-[380px] overflow-hidden bg-[#fff5f6] lg:block xl:w-[400px]">
          <img src={hospitalImage} alt="Hospital registration" className="h-full w-full object-cover object-left-top" />
        </aside>

        <section className="h-full min-w-0 overflow-y-auto bg-white py-2 pl-2 pr-0 sm:pl-3 lg:pl-4">
          <div className="mx-auto max-w-none">
            <div className="mb-6 lg:hidden">
              <img src={hospitalImage} alt="Hospital registration" className="max-h-72 w-full rounded-xl bg-[#fff5f6] object-contain object-top" />
            </div>

            <form onSubmit={handleSubmit} className="min-h-[calc(100vh-1rem)] rounded-xl rounded-r-none border border-r-0 border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="mb-3 border-b border-slate-100 pb-3">
                <h1 className="text-xl font-bold tracking-tight text-slate-950">Hospital Registration</h1>
              </div>

              <section className="space-y-2.5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <ShieldCheck className="h-4 w-4 text-rose-600" />
                  Account Details
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Hospital Email" required icon={Mail} type="email" placeholder="Enter hospital email" inputProps={{ name: "email", required: true }} />
                  <Field label="Password" required helper={showPasswordLengthError ? "Password must be at least 8 characters long" : ""}>
                    <div className={`flex h-9 items-center gap-2.5 rounded-md border bg-white px-3 shadow-sm transition focus-within:ring-4 ${showPasswordLengthError ? "border-rose-400 focus-within:ring-rose-100" : "border-slate-200 focus-within:border-rose-400 focus-within:ring-rose-100"}`}>
                      <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                      <input type={showPassword ? "text" : "password"} name="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400" />
                      <button type="button" onClick={() => setShowPassword((current) => !current)} className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-400 transition hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm Password" required helper={showConfirmPasswordError ? "Password and confirm password do not match" : ""}>
                    <div className={`flex h-9 items-center gap-2.5 rounded-md border bg-white px-3 shadow-sm transition focus-within:ring-4 ${showConfirmPasswordError ? "border-rose-400 focus-within:ring-rose-100" : "border-slate-200 focus-within:border-rose-400 focus-within:ring-rose-100"}`}>
                      <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                      <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400" />
                      <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-400 transition hover:text-slate-700" aria-label={showConfirmPassword ? "Hide confirm password" : "Show password"}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <HeartPulse className="h-4 w-4 text-rose-600" />
                  Hospital Information
                </h2>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Hospital Name" required icon={Building2} placeholder="Enter hospital name" inputProps={{ name: "name", required: true }} />
                  <Field label="Hospital Type" required>
                    <select name="hospitalType" required defaultValue="" className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100">
                      <option value="" disabled>Select type</option>
                      <option value="government">Government</option>
                      <option value="private">Private</option>
                      <option value="trust">Trust</option>
                      <option value="multispecialty">Multispecialty</option>
                      <option value="specialty">Specialty</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Registration / License Number" required icon={ShieldCheck} placeholder="Enter registration number" inputProps={{ name: "registrationNumber", required: true }} />
                  <Field label="Phone Number" required icon={Phone} type="tel" placeholder="Enter phone number" inputProps={{ name: "phoneNumber", required: true }} />
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <MapPin className="h-4 w-4 text-rose-600" />
                  Address & Location
                </h2>
                <div className="space-y-3">
                  <div className="min-w-0">
                    <Field label="Hospital Address" required>
                      <div className="relative">
                        <div className="flex h-9 items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 shadow-sm transition focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-100">
                          <Search className="h-4 w-4 shrink-0 text-slate-400" />
                          <input
                            type="text"
                            name="fullAddress"
                            required
                            value={address}
                            onChange={(event) => {
                              setAddress(event.target.value);
                              setSelectedAddress("");
                              setAddressParts({ city: "", district: "", state: "" });
                            }}
                            placeholder="Search hospital address..."
                            className="h-full min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                            autoComplete="off"
                          />
                        </div>
                        {(isSearchingAddress || addressSearchError || addressSuggestions.length > 0) && (
                          <div className="absolute left-0 right-0 top-10 z-20 overflow-hidden rounded-md border border-slate-200 bg-white text-xs shadow-lg">
                            {isSearchingAddress && <div className="px-3 py-2 font-semibold text-slate-500">Searching...</div>}
                            {!isSearchingAddress && addressSearchError && <div className="px-3 py-2 font-semibold text-rose-600">{addressSearchError}</div>}
                            {!isSearchingAddress && !addressSearchError && addressSuggestions.map((suggestion) => (
                              <button key={`${suggestion.formatted}-${suggestion.latitude}-${suggestion.longitude}`} type="button" onClick={() => handleAddressSuggestionSelect(suggestion)} className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2 text-left text-slate-700 transition last:border-b-0 hover:bg-rose-50 hover:text-rose-700">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
                                <span className="min-w-0 leading-5">{suggestion.formatted}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </Field>
                  </div>

                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 md:max-w-3xl">
                    <h3 className="text-xs font-bold text-slate-950">Exact Hospital Location <span className="text-rose-600">*</span></h3>
                    {hasSelectedLocation ? (
                      <div className="mt-1 space-y-1 text-xs">
                        <p className="font-semibold text-emerald-700">Location selected</p>
                        <p className="line-clamp-2 text-slate-600">{address || "Exact hospital location confirmed."}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Pin the exact location of your hospital.</p>
                    )}
                    <button type="button" onClick={() => setShowLocationPicker(true)} className="mt-3 flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-rose-700">
                        <MapPin className="h-4 w-4" />
                        {hasSelectedLocation ? "Change Location" : "Pick on Map"}
                      </button>
                    {locationError && <p className="mt-2 text-xs font-semibold text-rose-600">{locationError}</p>}
                  </div>
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <User className="h-4 w-4 text-rose-600" />
                  Authorized Contact
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Full Name" required icon={User} placeholder="Enter contact person name" inputProps={{ name: "contactName", required: true }} />
                  <Field label="Contact Number" required icon={Phone} type="tel" placeholder="Enter contact number" inputProps={{ name: "contactPhoneNumber", required: true }} />
                  <Field label="Contact Email" required icon={Mail} type="email" placeholder="Enter contact email" inputProps={{ name: "contactEmail", required: true }} />
                </div>
              </section>

              <section className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <FileText className="h-4 w-4 text-rose-600" />
                  Verification
                </h2>
                <div className="grid gap-3 md:max-w-xl">
                  <FileField
                    fileName={registrationDocumentName}
                    onFileChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setRegistrationDocument(file);
                      setRegistrationDocumentName(file?.name || "");
                    }}
                  />
                </div>
              </section>

              <div className="mt-4 border-t border-slate-100 pt-3">
                {submitMessage && (
                  <div className="mb-3 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold">Registration submitted</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">{submitMessage}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-h-5 min-w-0 text-xs font-semibold">
                    {formError && <p className="text-rose-600">{formError}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-rose-600 px-8 text-xs font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300">
                    {isSubmitting ? "Creating..." : "Create Hospital Account"}
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
