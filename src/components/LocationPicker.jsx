import { useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

const defaultCenter = [19.076, 72.8777];

const markerIcon = L.divIcon({
  className: "",
  html: '<div class="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-rose-600 text-white shadow-lg shadow-rose-200"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function LocationEvents({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function LocationPicker({ initialPosition, onConfirm, onClose }) {
  const [position, setPosition] = useState(initialPosition || null);

  const mapCenter = useMemo(() => {
    if (position) {
      return [position.latitude, position.longitude];
    }

    return defaultCenter;
  }, [position]);

  const hasSelectedLocation = Boolean(position);

  const handleConfirm = () => {
    if (!position) return;
    onConfirm(position);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-5 backdrop-blur-sm">
      <div className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-rose-100 bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-base font-bold text-slate-950">Select Blood Bank Location</h2>
            <p className="mt-1 text-xs text-slate-500">
              Click on the map or drag the marker to the exact location of your blood bank.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location picker"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:text-rose-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-3 sm:p-5">
          <div className="h-[350px] overflow-hidden rounded-lg border border-slate-200 md:h-[450px]">
            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationEvents onSelect={setPosition} />
              {position && (
                <Marker
                  draggable
                  icon={markerIcon}
                  position={[position.latitude, position.longitude]}
                  eventHandlers={{
                    dragend(event) {
                      const markerPosition = event.target.getLatLng();
                      setPosition({
                        latitude: markerPosition.lat,
                        longitude: markerPosition.lng,
                      });
                    },
                  }}
                />
              )}
            </MapContainer>
          </div>

          <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
              <MapPin className="h-4 w-4 text-rose-600" />
              Selected Location
            </div>
            {position ? (
              <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-slate-800">Latitude:</span> {position.latitude.toFixed(6)}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Longitude:</span> {position.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">No location selected yet.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md bg-slate-100 px-5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasSelectedLocation}
            className="h-9 rounded-md bg-rose-600 px-5 text-xs font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:shadow-none"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
