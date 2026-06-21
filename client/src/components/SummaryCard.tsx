import type { TripSummary } from "../types";

interface SummaryCardProps {
  loading: boolean;
  summary: TripSummary | null;
}

const riskCopy: Record<TripSummary["overallRisk"], string> = {
  safe: "Low route risk",
  possible: "Some rain possible",
  likely: "Rain expected",
  severe: "Severe weather risk"
};

const riskTone: Record<TripSummary["overallRisk"], string> = {
  safe: "bg-emerald-500",
  possible: "bg-amber-500",
  likely: "bg-orange-500",
  severe: "bg-rose-500"
};

const riskTextTone: Record<TripSummary["overallRisk"], string> = {
  safe: "text-emerald-700",
  possible: "text-amber-700",
  likely: "text-orange-700",
  severe: "text-rose-700"
};

function SummaryCard({ loading, summary }: SummaryCardProps) {
  if (loading) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-12 w-3/4 rounded bg-slate-200" />
          <div className="h-20 rounded-2xl bg-slate-100" />
          <div className="h-20 rounded-2xl bg-slate-100" />
        </div>
      </aside>
    );
  }

  if (!summary) {
    return (
      <aside className="flex min-h-[280px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">Trip summary</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            Route risk will show up here.
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Plan a route to see the drive time, distance, and the parts of the trip
            where rain may become a problem.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Best for open truck beds, roof racks, trailers, and weather-sensitive
          cargo.
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-slate-500">Trip summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {riskCopy[summary.overallRisk]}
          </h2>
        </div>

        <div className="grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Overall risk
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${riskTone[summary.overallRisk]}`} />
              <p className={`text-3xl font-semibold capitalize ${riskTextTone[summary.overallRisk]}`}>
                {summary.overallRisk}
              </p>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              {summary.recommendation}
            </p>
          </div>

          <div className="border-l-0 border-slate-200 pt-1 sm:border-l sm:pl-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Distance
            </p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">
              {summary.totalDistanceMiles.toFixed(0)} mi
            </p>
          </div>

          <div className="border-l-0 border-slate-200 pt-1 sm:border-l sm:pl-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Drive time
            </p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">
              {summary.totalDurationMinutes.toFixed(0)} min
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SummaryCard;
