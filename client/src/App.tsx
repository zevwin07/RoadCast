import { useState } from "react";
import RouteMap from "./components/RouteMap";
import SummaryCard from "./components/SummaryCard";
import TripForm from "./components/TripForm";
import WeatherTimeline from "./components/WeatherTimeline";
import type { TripRequest, TripResponse } from "./types";

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 760 300"
      className="h-auto w-full max-w-[520px]"
      aria-hidden="true"
    >
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* soft background road lines */}
        <g stroke="#d8ddd8" strokeWidth="3" opacity="0.75">
          <path d="M28 245 C145 222, 270 215, 382 220 C510 225, 615 214, 725 205" />
          <path d="M50 267 C175 246, 298 239, 420 241 C535 244, 640 235, 735 226" />
          <path d="M82 232 H138" />
          <path d="M182 225 H248" />
          <path d="M292 224 H358" />
          <path d="M428 229 H494" />
          <path d="M560 222 H626" />
          <path d="M668 218 H715" />
        </g>

        {/* mountains */}
        <g stroke="#d5dad7" strokeWidth="3" opacity="0.85">
          <path d="M38 132 L118 88 L186 132" />
          <path d="M92 102 L122 118 L154 139" />
          <path d="M126 104 L178 82 L260 134" />
          <path d="M235 128 L302 100 L384 142" />
          <path d="M106 91 L132 119" />
          <path d="M174 84 L207 118" />
          <path d="M303 101 L331 128" />
          <path d="M360 133 L382 142" />
        </g>

        {/* birds */}
        <g stroke="#d8ddd8" strokeWidth="3" opacity="0.75">
          <path d="M396 98 C405 89, 414 89, 423 98" />
          <path d="M468 85 C477 76, 488 76, 497 85" />
        </g>

        {/* left trees */}
        <g stroke="#9fbf9f" strokeWidth="3" opacity="0.95">
          <path d="M58 188 L78 144 L98 188 Z" />
          <path d="M78 188 V203" />
          <path d="M50 170 H65" />
          <path d="M54 156 H69" />
          <path d="M87 170 H102" />
          <path d="M83 156 H98" />

          <path d="M100 190 L126 126 L152 190 Z" />
          <path d="M126 190 V206" />
          <path d="M90 170 H112" />
          <path d="M96 153 H118" />
          <path d="M136 170 H158" />
          <path d="M132 153 H154" />

          <path d="M158 190 L178 151 L198 190 Z" />
          <path d="M178 190 V204" />
          <path d="M150 176 H166" />
          <path d="M154 164 H170" />
          <path d="M187 176 H203" />
          <path d="M184 164 H200" />

          <path d="M216 190 L238 143 L260 190 Z" />
          <path d="M238 190 V205" />
          <path d="M207 174 H226" />
          <path d="M213 160 H230" />
          <path d="M249 174 H268" />
          <path d="M245 160 H263" />

          <path d="M284 190 L302 154 L320 190 Z" />
          <path d="M302 190 V203" />
          <path d="M276 177 H291" />
          <path d="M281 166 H295" />
          <path d="M311 177 H326" />
          <path d="M308 166 H322" />
        </g>

        {/* ground lines */}
        <g stroke="#bfd4bf" strokeWidth="3" opacity="0.9">
          <path d="M32 205 H328" />
          <path d="M555 205 C605 205, 648 197, 704 198" />
          <path d="M696 194 L711 164 L726 194" />
          <path d="M711 194 V205" />
          <path d="M689 181 H704" />
          <path d="M694 169 H707" />
          <path d="M718 181 H733" />
          <path d="M715 169 H729" />
        </g>

        {/* truck */}
        <g stroke="#b9bdbc" strokeWidth="4" opacity="0.95">
          <path d="M326 177 H352 C358 145, 379 124, 405 124 H441 C451 124, 457 131, 457 141 V177 H548" />
          <path d="M457 149 H515 C528 149, 537 158, 541 177 H556 V198 H326 Z" />
          <path d="M352 177 V148 C352 141, 357 137, 365 137 H400" />
          <path d="M400 137 H437 V177 H385 V154 Z" />
          <path d="M372 143 L384 126" />
          <path d="M404 137 V177" />
          <path d="M448 177 V198" />
          <path d="M516 151 V198" />

          <circle cx="366" cy="199" r="22" />
          <circle cx="366" cy="199" r="12" />
          <circle cx="510" cy="199" r="22" />
          <circle cx="510" cy="199" r="12" />

          <path d="M322 198 H338" />
          <path d="M390 198 H486" />
          <path d="M532 198 H560" />

          <path d="M342 167 H360" />
          <path d="M421 159 H430" />
          <path d="M466 151 C477 145, 490 145, 503 151" />
          <path d="M481 146 C489 137, 497 137, 503 150" />
        </g>

        {/* cloud */}
        <g fill="#d3d7dd" opacity="0.95">
          <path d="M582 75 C589 54, 613 49, 629 62 C641 38, 676 33, 698 56 C717 47, 746 59, 748 87 H582 Z" />
          <path d="M552 88 C555 72, 570 63, 586 68 C596 50, 623 52, 631 72 C642 65, 660 72, 662 88 H552 Z" />
        </g>

        {/* rain */}
        <g stroke="#c7ccd3" strokeWidth="4" opacity="0.9">
          <path d="M582 120 L568 145" />
          <path d="M612 110 L598 136" />
          <path d="M642 121 L628 148" />
          <path d="M674 108 L659 138" />
          <path d="M706 121 L692 147" />
          <path d="M738 112 L724 138" />

          <path d="M558 157 L546 180" />
          <path d="M589 151 L576 176" />
          <path d="M620 160 L607 184" />
          <path d="M653 150 L640 176" />
          <path d="M684 158 L671 184" />
          <path d="M716 150 L703 176" />
        </g>
      </g>
    </svg>
  );
}

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
    <div className="min-h-screen bg-white text-slate-900">
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
          <nav className="flex items-center gap-7 text-sm font-medium leading-none text-slate-600">
            <a
              href="#plan-a-trip"
              className="inline-flex h-8 items-center border-b-2 border-brand-600 text-brand-600"
            >
              Plan a trip
            </a>
            <a
              href="#about"
              className="inline-flex h-8 items-center transition hover:text-slate-900"
            >
              About
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section id="plan-a-trip" className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
          <div className="space-y-5">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-[2.75rem] sm:leading-tight">
                  Know where rain could slow you down.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  We check the forecast along your route so you know when to cover
                  your load or change plans.
                </p>
              </div>

              <div className="hidden justify-end lg:flex">
                <HeroIllustration />
              </div>
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
