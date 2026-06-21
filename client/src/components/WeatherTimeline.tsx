import { useEffect, useState } from "react";
import WeatherCheckpointCard from "./WeatherCheckpointCard";
import type { WeatherCheckpoint } from "../types";

interface WeatherTimelineProps {
  checkpoints: WeatherCheckpoint[];
  loading: boolean;
}

function WeatherTimeline({ checkpoints, loading }: WeatherTimelineProps) {
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [checkpoints]);

  const visibleCheckpoints =
    showAll || checkpoints.length <= 7 ? checkpoints : checkpoints.slice(0, 7);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500">Forecast checkpoints</p>
        <h2 className="text-xl font-semibold text-slate-900">Checkpoint list</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : checkpoints.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_88px_88px_120px] gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <span>Mile + time</span>
                <span>Condition</span>
                <span>Temp</span>
                <span>Rain</span>
                <span>Risk</span>
              </div>

              {visibleCheckpoints.map((checkpoint) => (
                <WeatherCheckpointCard
                  key={`${checkpoint.distanceMiles}-${checkpoint.estimatedArrivalTime}`}
                  checkpoint={checkpoint}
                />
              ))}
            </div>
          </div>

          {checkpoints.length > 7 ? (
            <div className="border-t border-slate-200 bg-white p-3">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-brand-600 transition hover:bg-slate-50"
              >
                {showAll
                  ? "Show fewer checkpoints"
                  : `View all checkpoints (${checkpoints.length})`}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          No trip loaded yet. Checkpoints will appear here once a route is planned.
        </div>
      )}
    </section>
  );
}

export default WeatherTimeline;
