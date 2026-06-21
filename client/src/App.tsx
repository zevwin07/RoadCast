import { useState } from "react";
import RouteMap from "./components/RouteMap";
import SummaryCard from "./components/SummaryCard";
import TripForm from "./components/TripForm";
import WeatherTimeline from "./components/WeatherTimeline";
import type { TripRequest, TripResponse } from "./types";

function App() {
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: TripRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? "Unable to plan your trip.");
      }

      const data = (await response.json()) as TripResponse;
      setTrip(data);
    } catch (submitError) {
      setTrip(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while planning the route."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-road-gradient text-slate-100">
      <div className="road-grid min-h-screen">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] shadow-glow backdrop-blur">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-sm text-amber-100">
                  <span>RoadCast</span>
                  <span className="text-amber-300">Route-weather planner</span>
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                    See where rain could catch your cargo before you hit the road.
                  </h1>
                  <p className="max-w-2xl text-base text-slate-200/90 sm:text-lg">
                    Plan a drive, sample the forecast along the route, and spot the
                    moments when the truck bed may need a cover.
                  </p>
                </div>
                <TripForm onSubmit={handleSubmit} loading={loading} />
              </div>

              <SummaryCard summary={trip?.summary ?? null} loading={loading} />
            </div>
          </section>

          {error ? (
            <section className="rounded-3xl border border-rose-300/20 bg-rose-500/10 p-4 text-rose-100">
              {error}
            </section>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <RouteMap route={trip?.route ?? null} checkpoints={trip?.checkpoints ?? []} />
            <WeatherTimeline checkpoints={trip?.checkpoints ?? []} loading={loading} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
