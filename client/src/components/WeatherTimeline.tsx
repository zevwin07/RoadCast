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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-panel">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Forecast checkpoints</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100" />
          ))}
        </div>
      ) : checkpoints.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80">
          <div className="overflow-x-auto">
            <div className="min-w-[660px]">
              {visibleCheckpoints.map((checkpoint) => (
                <WeatherCheckpointCard
                  key={`${checkpoint.distanceMiles}-${checkpoint.estimatedArrivalTime}`}
                  checkpoint={checkpoint}
                />
              ))}
            </div>
          </div>

          {checkpoints.length > 7 ? (
            <div className="border-t border-slate-200/80 bg-white p-3">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200/80 px-4 text-sm font-medium text-brand-600 transition hover:bg-slate-50"
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
