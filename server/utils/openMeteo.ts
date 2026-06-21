interface OpenMeteoResponse {
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
}

function parseForecastTime(value: string) {
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value).getTime();
  }

  return new Date(`${value}:00Z`).getTime();
}

function findNearestHourIndex(times: string[], targetIso: string) {
  const target = new Date(targetIso).getTime();

  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  times.forEach((time, index) => {
    const delta = Math.abs(parseForecastTime(time) - target);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export async function getForecastForTime(lat: number, lng: number, isoTime: string) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lng.toString());
  url.searchParams.set("hourly", "temperature_2m,precipitation_probability,weather_code");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "GMT");
  url.searchParams.set("forecast_days", "7");

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Open-Meteo forecast lookup failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const hourly = data.hourly;

  if (
    !hourly?.time?.length ||
    !hourly.temperature_2m?.length ||
    !hourly.precipitation_probability?.length ||
    !hourly.weather_code?.length
  ) {
    throw new Error("Open-Meteo did not return hourly forecast data.");
  }

  const index = findNearestHourIndex(hourly.time, isoTime);

  return {
    temperature: hourly.temperature_2m[index] ?? 0,
    precipitationProbability: hourly.precipitation_probability[index] ?? 0,
    weatherCode: hourly.weather_code[index] ?? -1
  };
}
