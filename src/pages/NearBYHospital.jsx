import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { AlertCircle, ArrowRight, Building2, LoaderCircle, MapPin, Phone } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import { getNearbyHospitals } from "../api/hospitalApi";
import "leaflet/dist/leaflet.css";

const userIcon = L.divIcon({
  className: "",
  html: '<div class="relative h-12 w-12"><div class="absolute inset-0 rounded-full bg-sky-500/20"></div><div class="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white bg-sky-600 text-white shadow-lg shadow-sky-200"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/></svg></div></div>',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -18],
});

const hospitalIcon = L.divIcon({
  className: "",
  html: '<div class="relative h-12 w-12"><div class="absolute inset-x-0 top-0 mx-auto grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-white bg-emerald-600 text-white shadow-lg shadow-emerald-200"><svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 21v-6h6v6"/><path d="M10 9h4"/><path d="M12 7v4"/></svg></div><div class="absolute bottom-0 left-1/2 h-2 w-6 -translate-x-1/2 rounded-full bg-slate-900/20 blur-[1px]"></div></div>',
  iconSize: [48, 48],
  iconAnchor: [24, 44],
  popupAnchor: [0, -44],
});

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "Distance unavailable";
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
};

const getDistanceValue = (hospital) => hospital.routeDistanceInMeters ?? hospital.distanceInMeters;

const getPositionFromLocation = (location) => {
  const coordinates = location?.coordinates || [];
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  return [latitude, longitude];
};

function MapBounds({ userPosition, hospitals }) {
  const map = useMap();

  useEffect(() => {
    const hospitalPositions = hospitals.map((hospital) => getPositionFromLocation(hospital.location)).filter(Boolean);
    const positions = userPosition ? [userPosition, ...hospitalPositions] : hospitalPositions;

    if (!positions.length) return;

    map.fitBounds(L.latLngBounds(positions), {
      padding: [42, 42],
      maxZoom: 14,
    });
  }, [hospitals, map, userPosition]);

  return null;
}

function MapFocus({ selectedHospital }) {
  const map = useMap();

  useEffect(() => {
    const position = getPositionFromLocation(selectedHospital?.location);

    if (!position) return;

    map.flyTo(position, Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.55,
    });
  }, [map, selectedHospital]);

  return null;
}

export const NearByHospital = () => {
  const { setHeaderContent, user } = useOutletContext();
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setHeaderContent({
      title: "Nearby Hospitals",
      subtitle: "Explore nearby hospitals and their available facility",
      action: undefined,
    });
  }, [setHeaderContent]);

  useEffect(() => {
    const fetchNearHospitals = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getNearbyHospitals();
        const nearbyHospitals = response?.hospitals || [];

        setHospitals(nearbyHospitals);
        setSelectedHospitalId((currentId) => currentId || nearbyHospitals[0]?._id || "");
        setUserLocation(response?.userLocation || null);
      } catch (err) {
        setError(err.message || "Unable to load nearby hospitals.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearHospitals();
  }, []);

  const userPosition = useMemo(() => {
    return getPositionFromLocation(userLocation) || getPositionFromLocation(user?.location);
  }, [user?.location?.coordinates, userLocation?.coordinates]);

  const sortedHospitals = useMemo(() => {
    return [...hospitals].sort((firstHospital, secondHospital) => {
      const firstDistance = getDistanceValue(firstHospital) ?? Number.POSITIVE_INFINITY;
      const secondDistance = getDistanceValue(secondHospital) ?? Number.POSITIVE_INFINITY;
      return firstDistance - secondDistance;
    });
  }, [hospitals]);

  const selectedHospital = useMemo(() => {
    return sortedHospitals.find((hospital) => hospital._id === selectedHospitalId) || sortedHospitals[0] || null;
  }, [selectedHospitalId, sortedHospitals]);

  const defaultCenter = userPosition || [19.076, 72.8777];

  if (isLoading) {
    return (
      <div className="px-2 py-3 sm:px-4">
        <div className="flex min-h-96 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
          <LoaderCircle className="mr-2 size-5 animate-spin text-emerald-600" />
          Loading nearby hospitals...
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
            <h2 className="text-base font-extrabold text-slate-950">Hospitals Near You</h2>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {hospitals.length ? `${hospitals.length} approved hospitals found nearby` : "No approved hospitals found nearby"}
            </p>
          </div>
          {user?.short_address ? (
            <span className="inline-flex max-w-md items-center gap-2 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              <MapPin className="size-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">{user.short_address}</span>
            </span>
          ) : null}
        </div>

        <div className="min-h-[560px]">
          <div className="relative h-[calc(100vh-250px)] min-h-[560px] bg-slate-100">
            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom className="h-full w-full">
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapBounds userPosition={userPosition} hospitals={hospitals} />
              <MapFocus selectedHospital={selectedHospital} />

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

              {hospitals.map((hospital) => {
                const position = getPositionFromLocation(hospital.location);
                if (!position) return null;

                return (
                  <Marker
                    key={hospital._id}
                    icon={hospitalIcon}
                    position={position}
                    eventHandlers={{
                      click: () => setSelectedHospitalId(hospital._id),
                    }}
                  >
                    <Popup minWidth={0} maxWidth={260}>
                      <div className="w-56 space-y-2">
                        <div className="pr-4">
                          <p className="line-clamp-2 text-sm font-extrabold leading-4 text-slate-950">{hospital.name}</p>
                          <p className="mt-1 text-[11px] font-bold text-emerald-600">
                            {formatDistance(getDistanceValue(hospital))}
                          </p>
                        </div>
                        <p className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold capitalize text-emerald-700">
                          {hospital.hospitalType || "Hospital"}
                        </p>
                        <p className="flex gap-1.5 text-[11px] font-semibold leading-4 text-slate-600">
                          <Building2 className="mt-0.5 size-3 shrink-0 text-slate-400" />
                          <span className="line-clamp-2">{hospital.fullAddress || hospital.location?.fullAddress || "Address not available"}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                          <Phone className="size-3 shrink-0 text-slate-400" />
                          {hospital.phoneNumber || hospital.contactPerson?.phoneNumber || "Phone not available"}
                        </p>
                        <Link
                          to={`/hospitals/${hospital._id}/dashboard`}
                          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-3 text-[11px] font-extrabold !text-white transition hover:bg-emerald-700"
                        >
                          View Hospital
                          <ArrowRight className="size-3.5" />
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
