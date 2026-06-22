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
  Unknown: "•"
};

const riskDot: Record<WeatherCheckpoint["riskLevel"], string> = {
  safe: "bg-emerald-500",
  possible: "bg-amber-500",
  likely: "bg-orange-500",
  severe: "bg-rose-500"
};

function WeatherCheckpointCard({ checkpoint }: WeatherCheckpointCardProps) {
  return (
    <article className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_84px_84px_116px] items-center gap-3 border-t border-slate-200/80 px-4 py-4 text-sm text-slate-700 first:border-t-0">
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">
          {checkpoint.distanceMiles.toFixed(0)} mi
        </p>
        <p className="truncate text-xs text-slate-500">{checkpoint.arrivalTimeLabel}</p>
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">
          {conditionIcon[checkpoint.condition] ?? "•"} {checkpoint.condition}
        </p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">{checkpoint.temperature.toFixed(0)}°F</p>
      </div>

      <div>
        <p className="font-semibold text-slate-900">
          {checkpoint.precipitationProbability}%
        </p>
      </div>

      <div className="flex items-center gap-2 justify-self-start rounded-full border border-slate-200/80 px-3 py-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${riskDot[checkpoint.riskLevel]}`} />
        <span className="text-sm font-medium capitalize text-slate-700">
          {checkpoint.riskLevel}
        </span>
      </div>
    </article>
  );
}

export default WeatherCheckpointCard;
