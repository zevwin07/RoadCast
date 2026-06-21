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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <a href="#" className="text-2xl font-semibold tracking-tight text-brand-600">
              RoadCast
            </a>
            <span className="hidden text-sm text-slate-500 md:inline">
              Route-weather planner
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#plan-a-trip"
              className="border-b-2 border-brand-600 pb-1 text-brand-600"
            >
              Plan a trip
            </a>
            <a href="#about" className="transition hover:text-slate-900">
              About
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section id="plan-a-trip" className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Route-weather planner
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Know where rain could slow you down.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                We check the forecast along your route so you know when to cover
                your load or change plans.
              </p>
            </div>

            <TripForm onSubmit={handleSubmit} loading={loading} />
          </div>

          <SummaryCard summary={trip?.summary ?? null} loading={loading} />
        </section>

        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.65fr_0.95fr]">
          <RouteMap route={trip?.route ?? null} checkpoints={trip?.checkpoints ?? []} />
          <WeatherTimeline checkpoints={trip?.checkpoints ?? []} loading={loading} />
        </section>

        <section id="about" className="pb-8 text-sm text-slate-500">
          RoadCast helps drivers spot rain risk before departure, especially when
          cargo is exposed to the weather.
        </section>
      </main>
    </div>
  );
}

export default App;
