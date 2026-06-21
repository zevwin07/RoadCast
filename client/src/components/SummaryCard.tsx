import type { TripSummary } from "../types";

interface SummaryCardProps {
  loading: boolean;
  summary: TripSummary | null;
}

const riskCopy: Record<TripSummary["overallRisk"], string> = {
  safe: "Dry outlook",
  possible: "Watch the sky",
  likely: "Rain ahead",
  severe: "Storm concern"
};

const riskTone: Record<TripSummary["overallRisk"], string> = {
  safe: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  possible: "border-amber-300/20 bg-amber-400/10 text-amber-50",
  likely: "border-sky-300/20 bg-sky-400/10 text-sky-50",
  severe: "border-rose-300/20 bg-rose-500/10 text-rose-50"
};

function SummaryCard({ loading, summary }: SummaryCardProps) {
  if (loading) {
    return (
      <aside className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="h-14 w-3/4 rounded bg-white/10" />
          <div className="h-24 rounded-3xl bg-white/10" />
          <div className="h-24 rounded-3xl bg-white/10" />
        </div>
      </aside>
    );
  }

  if (!summary) {
    return (
      <aside className="flex min-h-[320px] flex-col justify-between rounded-[2rem] border border-dashed border-white/15 bg-slate-950/40 p-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
            Trip summary
          </p>
          <h2 className="text-3xl font-black text-white">
            Route risk will show up here.
          </h2>
          <p className="text-slate-300">
            Enter a start, destination, and departure time to see where rain may
            hit along the drive.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          Best for open truck beds, luggage carriers, motorcycles, and anyone trying
          to avoid weather surprises.
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
          Trip summary
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">
          {riskCopy[summary.overallRisk]}
        </h2>
      </div>

      <div className={`rounded-3xl border p-4 ${riskTone[summary.overallRisk]}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">
          Overall risk
        </p>
        <p className="mt-2 text-2xl font-black capitalize">
          {summary.overallRisk}
        </p>
        <p className="mt-3 text-sm">{summary.recommendation}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Distance</p>
          <p className="mt-2 text-3xl font-black text-white">
            {summary.totalDistanceMiles.toFixed(0)} mi
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-400">Drive time</p>
          <p className="mt-2 text-3xl font-black text-white">
            {summary.totalDurationMinutes.toFixed(0)} min
          </p>
        </div>
      </div>
    </aside>
  );
}

export default SummaryCard;
