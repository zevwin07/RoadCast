import WeatherCheckpointCard from "./WeatherCheckpointCard";
import type { WeatherCheckpoint } from "../types";

interface WeatherTimelineProps {
  checkpoints: WeatherCheckpoint[];
  loading: boolean;
}

function WeatherTimeline({ checkpoints, loading }: WeatherTimelineProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-5">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
          Timeline
        </p>
        <h2 className="text-xl font-black text-white">Checkpoint forecast cards</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : checkpoints.length > 0 ? (
        <div className="space-y-4">
          {checkpoints.map((checkpoint) => (
            <WeatherCheckpointCard
              key={`${checkpoint.distanceMiles}-${checkpoint.estimatedArrivalTime}`}
              checkpoint={checkpoint}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-5 text-slate-300">
          No trip loaded yet. Once a route is planned, weather checkpoints will show
          up here in drive order.
        </div>
      )}
    </section>
  );
}

export default WeatherTimeline;
