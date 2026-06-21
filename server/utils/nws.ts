const nwsHeaders = {
  "User-Agent": "RoadCast/1.0 (roadcast.app, support@roadcast.app)",
  Accept: "application/geo+json"
};

const forecastCacheTtlMs = 30 * 60 * 1000;

interface NwsPointResponse {
  properties?: {
    gridId?: string;
    gridX?: number;
    gridY?: number;
    forecastHourly?: string;
    timeZone?: string;
  };
}

interface NwsHourlyResponse {
  properties?: {
    periods?: Array<{
      startTime: string;
      endTime: string;
      temperature: number;
      shortForecast: string;
      probabilityOfPrecipitation?: {
        value: number | null;
      };
    }>;
  };
}

interface CachedForecastEntry {
  cachedAt: number;
  forecast: NwsHourlyResponse;
}

const forecastCache = new Map<string, CachedForecastEntry>();

export class OutsideUnitedStatesError extends Error {
  constructor() {
    super(
      "This route leaves the United States. RoadCast currently supports U.S. trips only with National Weather Service coverage."
    );
    this.name = "OutsideUnitedStatesError";
  }
}

function getNearestPeriod(
  periods: Array<{
    startTime: string;
    endTime: string;
    temperature: number;
    shortForecast: string;
    probabilityOfPrecipitation?: {
      value: number | null;
    };
  }>,
  targetIso: string
) {
  const targetTime = new Date(targetIso).getTime();
  let bestPeriod = periods[0];
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const period of periods) {
    const start = new Date(period.startTime).getTime();
    const end = new Date(period.endTime).getTime();

    if (targetTime >= start && targetTime < end) {
      return period;
    }

    const delta = Math.abs(start - targetTime);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestPeriod = period;
    }
  }

  return bestPeriod;
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, { headers: nwsHeaders });

  if (response.status === 404) {
    throw new OutsideUnitedStatesError();
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NWS request failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as T;
}

export async function getForecastForTime(lat: number, lng: number, isoTime: string) {
  const pointData = await fetchJson<NwsPointResponse>(
    `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`
  );

  const gridId = pointData.properties?.gridId;
  const gridX = pointData.properties?.gridX;
  const gridY = pointData.properties?.gridY;
  const forecastHourlyUrl = pointData.properties?.forecastHourly;
  const timeZone = pointData.properties?.timeZone;

  if (
    !gridId ||
    typeof gridX !== "number" ||
    typeof gridY !== "number" ||
    !forecastHourlyUrl ||
    !timeZone
  ) {
    throw new OutsideUnitedStatesError();
  }

  const cacheKey = `${gridId}/${gridX},${gridY}`;
  const cachedEntry = forecastCache.get(cacheKey);
  const now = Date.now();

  let forecastData: NwsHourlyResponse;

  if (cachedEntry && now - cachedEntry.cachedAt < forecastCacheTtlMs) {
    forecastData = cachedEntry.forecast;
  } else {
    forecastData = await fetchJson<NwsHourlyResponse>(forecastHourlyUrl);
    forecastCache.set(cacheKey, {
      cachedAt: now,
      forecast: forecastData
    });
  }

  const periods = forecastData.properties?.periods ?? [];
  if (periods.length === 0) {
    throw new Error("NWS hourly forecast data was unavailable for this checkpoint.");
  }

  const period = getNearestPeriod(periods, isoTime);

  return {
    temperature: period.temperature ?? 0,
    precipitationProbability: period.probabilityOfPrecipitation?.value ?? 0,
    condition: period.shortForecast || "Unknown",
    timeZone
  };
}
