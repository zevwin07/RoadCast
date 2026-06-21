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
  safe: "#22c55e",
  possible: "#f59e0b",
  likely: "#38bdf8",
  severe: "#f43f5e"
};

const buildMarkerIcon = (riskLevel: WeatherCheckpoint["riskLevel"]) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${markerHtmlByRisk[riskLevel]};width:16px;height:16px;border:3px solid white;border-radius:999px;box-shadow:0 6px 18px rgba(15,23,42,0.45)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
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
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/45 p-3 shadow-glow">
      <div className="mb-3 flex items-center justify-between px-2 pt-2">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Map</p>
          <h2 className="text-xl font-black text-white">Route + forecast stops</h2>
        </div>
      </div>
      <div className="h-[420px] overflow-hidden rounded-[1.5rem]">
        <MapContainer center={center as [number, number]} zoom={5} scrollWheelZoom>
          <FitRouteBounds route={route} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {route ? (
            <Polyline
              positions={route.coordinates}
              pathOptions={{ color: "#f59e0b", weight: 5, opacity: 0.9 }}
            />
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
                  <div>{new Date(checkpoint.estimatedArrivalTime).toLocaleString()}</div>
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
