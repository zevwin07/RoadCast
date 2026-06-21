import { useEffect, useId, useRef, useState } from "react";
import type {
  AddressSuggestion,
  RainSensitivity,
  TripRequest
} from "../types";

interface TripFormProps {
  loading: boolean;
  onSubmit: (payload: TripRequest) => Promise<void>;
}

const defaultDeparture = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

interface AutocompleteInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function AutocompleteInput({
  label,
  placeholder,
  value,
  onChange
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestSequence = useRef(0);
  const blurTimeout = useRef<number | null>(null);
  const skipNextFetchValue = useRef<string | null>(null);
  const listId = useId();

  useEffect(() => {
    if (skipNextFetchValue.current === value) {
      skipNextFetchValue.current = null;
      setLoadingSuggestions(false);
      return;
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoadingSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    const currentRequest = requestSequence.current + 1;
    requestSequence.current = currentRequest;

    const timeoutId = window.setTimeout(async () => {
      setLoadingSuggestions(true);

      try {
        const response = await fetch(
          `/api/autocomplete?text=${encodeURIComponent(value.trim())}`
        );

        if (!response.ok) {
          throw new Error("Unable to load address suggestions.");
        }

        const data = (await response.json()) as AddressSuggestion[];

        if (requestSequence.current === currentRequest) {
          setSuggestions(data.slice(0, 5));
          setOpen(data.length > 0);
          setActiveIndex(-1);
        }
      } catch {
        if (requestSequence.current === currentRequest) {
          setSuggestions([]);
          setOpen(false);
          setActiveIndex(-1);
        }
      } finally {
        if (requestSequence.current === currentRequest) {
          setLoadingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    return () => {
      if (blurTimeout.current !== null) {
        window.clearTimeout(blurTimeout.current);
      }
    };
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    skipNextFetchValue.current = suggestion.label;
    onChange(suggestion.label);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      <div className="relative">
        <input
          required
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(event.target.value.trim().length >= 3);
          }}
          onFocus={() => {
            if (value.trim().length >= 3 && suggestions.length > 0) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            blurTimeout.current = window.setTimeout(() => {
              setOpen(false);
              setActiveIndex(-1);
            }, 120);
          }}
          onKeyDown={(event) => {
            if (!open || suggestions.length === 0) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) =>
                current < suggestions.length - 1 ? current + 1 : 0
              );
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) =>
                current > 0 ? current - 1 : suggestions.length - 1
              );
            }

            if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              handleSelect(suggestions[activeIndex]);
            }

            if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
        />

        {loadingSuggestions && value.trim().length >= 3 ? (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-300">
            Searching...
          </div>
        ) : null}

        {open && suggestions.length > 0 ? (
          <div
            id={listId}
            className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur"
            role="listbox"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.label}-${index}`}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(suggestion);
                }}
                className={`flex w-full flex-col rounded-xl px-3 py-3 text-left transition ${
                  index === activeIndex
                    ? "bg-amber-300/15 text-white"
                    : "text-slate-200 hover:bg-white/10"
                }`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <span className="text-sm font-semibold">{suggestion.label}</span>
                {suggestion.name && suggestion.name !== suggestion.label ? (
                  <span className="mt-1 text-xs text-slate-400">
                    {suggestion.name}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </label>
  );
}

function TripForm({ loading, onSubmit }: TripFormProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState(defaultDeparture());
  const [checkpointMiles, setCheckpointMiles] = useState(50);
  const [rainSensitivity, setRainSensitivity] =
    useState<RainSensitivity>("medium");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      origin,
      destination,
      departureTime,
      checkpointMiles,
      rainSensitivity
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <AutocompleteInput
          label="Starting location"
          placeholder="Austin, TX"
          value={origin}
          onChange={setOrigin}
        />

        <AutocompleteInput
          label="Destination"
          placeholder="Houston, TX"
          value={destination}
          onChange={setDestination}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-200">
            Departure date and time
          </span>
          <input
            required
            type="datetime-local"
            value={departureTime}
            onChange={(event) => setDepartureTime(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-200">
            Checkpoint spacing
          </span>
          <div className="relative">
            <input
              min={10}
              step={10}
              type="number"
              value={checkpointMiles}
              onChange={(event) => setCheckpointMiles(Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 pr-16 text-white outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-300">
              miles
            </span>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-200">
            Rain sensitivity
          </span>
          <select
            value={rainSensitivity}
            onChange={(event) =>
              setRainSensitivity(event.target.value as RainSensitivity)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/20"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-base font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-200 sm:w-auto"
      >
        {loading ? "Checking the route..." : "Plan this drive"}
      </button>
    </form>
  );
}

export default TripForm;
