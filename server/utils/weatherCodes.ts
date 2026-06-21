export function getWeatherConditionLabel(forecastText: string) {
  const normalized = forecastText.toLowerCase();

  if (
    normalized.includes("thunderstorm") ||
    normalized.includes("t-storm") ||
    normalized.includes("storm")
  ) {
    return "Storm";
  }

  if (normalized.includes("snow") || normalized.includes("sleet")) {
    return "Snow";
  }

  if (normalized.includes("drizzle")) {
    return "Drizzle";
  }

  if (normalized.includes("rain") || normalized.includes("showers")) {
    return "Rain";
  }

  if (
    normalized.includes("fog") ||
    normalized.includes("haze") ||
    normalized.includes("mist")
  ) {
    return "Foggy";
  }

  if (
    normalized.includes("partly cloudy") ||
    normalized.includes("partly sunny") ||
    normalized.includes("mostly sunny") ||
    normalized.includes("mostly cloudy") ||
    normalized.includes("mostly clear")
  ) {
    return "Partly Cloudy";
  }

  if (normalized.includes("cloudy") || normalized.includes("overcast")) {
    return "Cloudy";
  }

  if (normalized.includes("sunny") || normalized.includes("clear")) {
    return "Sunny";
  }

  return "Unknown";
}
