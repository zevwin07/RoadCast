import type { WeatherCheckpoint } from "../types";

interface WeatherCheckpointCardProps {
  checkpoint: WeatherCheckpoint;
}

const conditionIcon: Record<string, string> = {
  Sunny: "☀️",
  "Partly Cloudy": "⛅",
  Cloudy: "☁️",
  Foggy: "🌫️",
  Drizzle: "🌦️",
  Rain: "🌧️",
  Storm: "⛈️",
  Snow: "❄️",
  Unknown: "🧭"
};

const riskBorder: Record<WeatherCheckpoint["riskLevel"], string> = {
  safe: "border-emerald-300/20 bg-emerald-400/10",
  possible: "border-amber-300/20 bg-amber-400/10",
  likely: "border-sky-300/20 bg-sky-400/10",
  severe: "border-rose-300/20 bg-rose-500/10"
};

function WeatherCheckpointCard({ checkpoint }: WeatherCheckpointCardProps) {
  return (
    <article className={`rounded-3xl border p-4 ${riskBorder[checkpoint.riskLevel]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-200/70">
            Mile {checkpoint.distanceMiles.toFixed(0)}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {conditionIcon[checkpoint.condition] ?? "🧭"} {checkpoint.condition}
          </h3>
          <p className="mt-1 text-sm text-slate-100/85">
            {checkpoint.arrivalTimeLabel}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950/30 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Risk</p>
          <p className="text-lg font-black capitalize text-white">
            {checkpoint.riskLevel}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-950/25 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
            Temperature
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {checkpoint.temperature.toFixed(0)}°F
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950/25 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
            Rain chance
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {checkpoint.precipitationProbability}%
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950/25 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
            Coordinates
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {checkpoint.lat.toFixed(2)}, {checkpoint.lng.toFixed(2)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-100">{checkpoint.advice}</p>
    </article>
  );
}

export default WeatherCheckpointCard;
