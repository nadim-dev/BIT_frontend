import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { AlertCircle, ArrowUpRight, Building2, Clock, LoaderCircle, MapPin, Phone } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { getNearbyBloodBanks } from "../api/bloodBankApi.js";
import "leaflet/dist/leaflet.css";

const userIcon = L.divIcon({
  className: "",
  html: '<div class="relative h-12 w-12"><div class="absolute inset-0 rounded-full bg-sky-500/20"></div><div class="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white bg-sky-600 text-white shadow-lg shadow-sky-200"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/></svg></div></div>',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -18],
});

const bloodBankIcon = L.divIcon({
  className: "",
  html: '<div class="relative h-12 w-12"><div class="absolute inset-x-0 top-0 mx-auto grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-white bg-[#D90429] text-white shadow-lg shadow-red-200"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M10 10h4"/><path d="M12 8v4"/></svg></div><div class="absolute bottom-0 left-1/2 h-2 w-6 -translate-x-1/2 rounded-full bg-slate-900/20 blur-[1px]"></div></div>',
  iconSize: [48, 48],
  iconAnchor: [24, 44],
  popupAnchor: [0, -44],
});

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "Distance unavailable";
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
};

const getDistanceValue = (bank) => bank.routeDistanceInMeters ?? bank.distanceInMeters;

const getWorkingHours = (bank) => {
  if (bank.workingHours?.isOpen24Hours) return "Open 24 hours";
  return `${bank.workingHours?.openingTime || "--"} - ${bank.workingHours?.closingTime || "--"}`;
};

const bloodGroupOrder = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const bloodComponents = ["PRBC", "Platelets", "Plasma"];

const getInventoryUnits = (bank, bloodGroup, component = "PRBC") => {
  const inventoryItem = bank.inventory?.find(
    (item) => item.bloodGroup === bloodGroup && (item.type || item.component || "PRBC") === component,
  );
  const units = Number(inventoryItem?.unitsAvailable || 0);

  return String(Number.isFinite(units) ? units : 0).padStart(2, "0");
};

const getBankPosition = (bank) => {
  const coordinates = bank?.location?.coordinates || [];
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return [latitude, longitude];
};

const getBloodBankDashboardHref = (bankId) => `/blood-bank/${bankId}/dashboard`;

const getUserPosition = (location) => {
  const coordinates = location?.coordinates;

  if (Array.isArray(coordinates)) {
    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return [latitude, longitude];
  }

  const latitude = Number(coordinates?.latitude);
  const longitude = Number(coordinates?.longitude);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return [latitude, longitude];
};

const getUserCoordinates = (location) => {
  const position = getUserPosition(location);

  if (!position) return null;

  return {
    latitude: position[0],
    longitude: position[1],
  };
};

function MapBounds({ userPosition, bloodBanks }) {
  const map = useMap();

  useEffect(() => {
    const bankPositions = bloodBanks.map(getBankPosition).filter(Boolean);
    const positions = userPosition ? [userPosition, ...bankPositions] : bankPositions;

    if (!positions.length) return;

    map.fitBounds(L.latLngBounds(positions), {
      padding: [42, 42],
      maxZoom: 14,
    });
  }, [bloodBanks, map, userPosition]);

  return null;
}

function MapFocus({ selectedBank }) {
  const map = useMap();

  useEffect(() => {
    const position = getBankPosition(selectedBank);

    if (!position) return;

    map.flyTo(position, Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.55,
    });
  }, [map, selectedBank]);

  return null;
}

export const BloodBankPage = () => {
  const { setHeaderContent, user } = useOutletContext();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedBloodBankId, setSelectedBloodBankId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Nearby Blood Banks",
      subtitle: "Explore nearby blood banks and their available blood inventory",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchNearbyBloodBanks = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getNearbyBloodBanks(getUserCoordinates(user?.location));
        const nearbyBloodBanks = response?.bloodBanks || [];
        setBloodBanks(nearbyBloodBanks);
        setSelectedBloodBankId((currentId) => currentId || nearbyBloodBanks[0]?._id || "");
        setUserLocation(response?.userLocation || null);
      } catch (err) {
        setError(err.message || "Unable to load nearby blood banks.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyBloodBanks();
  }, [user?.location]);

  const userPosition = useMemo(() => {
    return getUserPosition(userLocation) || getUserPosition(user?.location);
  }, [user?.location?.coordinates, userLocation?.coordinates]);

  const defaultCenter = userPosition || [19.076, 72.8777];
  const sortedBloodBanks = useMemo(() => {
    return [...bloodBanks].sort((firstBank, secondBank) => {
      const firstDistance = getDistanceValue(firstBank) ?? Number.POSITIVE_INFINITY;
      const secondDistance = getDistanceValue(secondBank) ?? Number.POSITIVE_INFINITY;
      return firstDistance - secondDistance;
    });
  }, [bloodBanks]);

  const selectedBloodBank = useMemo(() => {
    return sortedBloodBanks.find((bank) => bank._id === selectedBloodBankId) || sortedBloodBanks[0] || null;
  }, [selectedBloodBankId, sortedBloodBanks]);

  if (isLoading) {
    return (
      <div className="px-2 py-3 sm:px-4">
        <div className="flex min-h-96 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-[#D90429]" />
          Loading nearby blood banks...
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-3 sm:px-4">
      {error ? (
        <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          <AlertCircle className="mr-2 inline size-4" />
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-950">Blood Banks Near You</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {bloodBanks.length ? `${bloodBanks.length} approved blood banks found nearby` : "No approved blood banks found nearby"}
            </p>
          </div>
          {user?.short_address ? (
            <span className="inline-flex max-w-md items-center gap-2 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              <MapPin className="size-3.5 shrink-0 text-[#D90429]" />
              <span className="truncate">{user.short_address}</span>
            </span>
          ) : null}
        </div>

        <div className="min-h-[560px]">
          <div className="relative h-[calc(100vh-250px)] min-h-[560px] bg-slate-100">
            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom className="h-full w-full">
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapBounds userPosition={userPosition} bloodBanks={bloodBanks} />
              <MapFocus selectedBank={selectedBloodBank} />

              {userPosition ? (
                <Marker icon={userIcon} position={userPosition}>
                  <Popup className="user-location-popup" closeButton={false} minWidth={0} maxWidth={160}>
                    <div className="w-32">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                          <MapPin className="size-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-extrabold leading-3 text-slate-950">Your Location</p>
                          <p className="mt-0.5 truncate text-[10px] font-semibold leading-3 text-slate-500">{user?.short_address || "Current saved location"}</p>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null}

              {bloodBanks.map((bank) => {
                const position = getBankPosition(bank);
                if (!position) return null;

                return (
                  <Marker
                    key={bank._id}
                    icon={bloodBankIcon}
                    position={position}
                    eventHandlers={{
                      click: () => setSelectedBloodBankId(bank._id),
                    }}
                  >
                    <Popup>
                      <div className="w-72 space-y-2">
                        <div>
                          <p className="text-sm font-extrabold text-slate-950">{bank.bloodBankName}</p>
                          <p className="mt-0.5 text-xs font-bold text-[#D90429]">
                            {formatDistance(getDistanceValue(bank))}
                          </p>
                        </div>
                        <p className="flex gap-2 text-xs font-semibold text-slate-600">
                          <Building2 className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                          <span>{bank.address?.completeAddress || bank.address?.city || "Address not available"}</span>
                        </p>
                        <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Phone className="size-3.5 shrink-0 text-slate-400" />
                          {bank.phoneNumber || "Phone not available"}
                        </p>
                        <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <Clock className="size-3.5 shrink-0 text-slate-400" />
                          {getWorkingHours(bank)}
                        </p>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2">
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Blood Availability</p>
                          <div className="mt-1.5 space-y-1.5">
                            {bloodComponents.map((component) => (
                              <div key={component}>
                                <p className="mb-1 text-[10px] font-extrabold text-slate-500">{component}</p>
                                <div className="grid grid-cols-4 gap-x-2 gap-y-1">
                                  {bloodGroupOrder.map((bloodGroup) => (
                                    <div key={`${component}-${bloodGroup}`} className="flex items-center justify-between rounded bg-white px-1.5 py-1 text-[11px] font-bold tabular-nums text-slate-700">
                                      <span className="text-slate-500">{bloodGroup}</span>
                                      <span className="text-slate-950">{getInventoryUnits(bank, bloodGroup, component)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Link
                          to={getBloodBankDashboardHref(bank._id)}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[#D90429] px-3 py-2 text-xs font-bold !text-white no-underline transition hover:bg-[#b80322] hover:!text-white focus:outline-none focus:ring-2 focus:ring-[#D90429]/25"
                        >
                          View Dashboard
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </section>
    </div>
  );
};
