export function getWeatherConditionLabel(weatherCode: number) {
  if (weatherCode === 0) {
    return "Sunny";
  }

  if ([1, 2].includes(weatherCode)) {
    return "Partly Cloudy";
  }

  if (weatherCode === 3 || [45, 48].includes(weatherCode)) {
    return weatherCode === 3 ? "Cloudy" : "Foggy";
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
    return "Rain";
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return "Storm";
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "Snow";
  }

  return "Unknown";
}
