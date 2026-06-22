import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap
} from "react-leaflet";
import type { RoutePayload, WeatherCheckpoint } from "../types";

interface RouteMapProps {
  route: RoutePayload | null;
  checkpoints: WeatherCheckpoint[];
}

const markerHtmlByRisk = {
  safe: "#16a34a",
  possible: "#f59e0b",
  likely: "#f97316",
  severe: "#f43f5e"
};

const startIcon = L.divIcon({
  className: "",
  html: '<div style="background:#16a34a;width:18px;height:18px;border:3px solid white;border-radius:999px;box-shadow:0 2px 10px rgba(15,23,42,0.22)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const destinationIcon = L.divIcon({
  className: "",
  html: '<div style="background:#ef4444;width:18px;height:18px;border:3px solid white;border-radius:999px;box-shadow:0 2px 10px rgba(15,23,42,0.22)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const buildMarkerIcon = (riskLevel: WeatherCheckpoint["riskLevel"]) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${markerHtmlByRisk[riskLevel]};width:10px;height:10px;border:2px solid white;border-radius:999px;box-shadow:0 2px 8px rgba(15,23,42,0.18)"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });

const defaultCenter: [number, number] = [39.5, -98.35];

function FitRouteBounds({ route }: { route: RoutePayload | null }) {
  const map = useMap();

  useEffect(() => {
    if (route && route.coordinates.length > 1) {
      map.fitBounds(route.coordinates, {
        padding: [32, 32]
      });
    }
  }, [map, route]);

  return null;
}

function RouteMap({ route, checkpoints }: RouteMapProps) {
  const center: [number, number] = route?.coordinates[0]
    ? route.coordinates[0]
    : checkpoints[0]
      ? [checkpoints[0].lat, checkpoints[0].lng]
      : defaultCenter;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-panel">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Route overview</h2>
      </div>
      <div className="h-[520px] overflow-hidden rounded-2xl border border-slate-200/80">
        <MapContainer center={center as [number, number]} zoom={5} scrollWheelZoom>
          <FitRouteBounds route={route} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {route ? (
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: "#64748b", weight: 4, opacity: 0.8 }}
            />
          ) : null}

          {route?.coordinates[0] ? (
            <Marker position={route.coordinates[0]} icon={startIcon}>
              <Popup>Trip start</Popup>
            </Marker>
          ) : null}

          {route?.coordinates.at(-1) ? (
            <Marker position={route.coordinates.at(-1)!} icon={destinationIcon}>
              <Popup>Destination</Popup>
            </Marker>
          ) : null}

          {checkpoints.map((checkpoint) => (
            <Marker
              key={`${checkpoint.lat}-${checkpoint.lng}-${checkpoint.distanceMiles}`}
              position={[checkpoint.lat, checkpoint.lng]}
              icon={buildMarkerIcon(checkpoint.riskLevel)}
            >
              <Popup>
                <div className="space-y-1">
                  <strong>{checkpoint.condition}</strong>
                  <div>{checkpoint.distanceMiles.toFixed(0)} miles into trip</div>
                  <div>{checkpoint.arrivalTimeLabel}</div>
                  <div>{checkpoint.precipitationProbability}% rain chance</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

export default RouteMap;
