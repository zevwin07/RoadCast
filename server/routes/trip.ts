import { Router } from "express";
import {
  buildRiskSummary,
  getCheckpointAdvice,
  getRiskLevel
} from "../utils/risk.js";
import {
  geocodeLocation,
  getDrivingRoute
} from "../utils/openRouteService.js";
import { createCheckpoints } from "../utils/checkpoints.js";
import {
  getForecastForTime,
  OutsideUnitedStatesError
} from "../utils/nws.js";
import { getWeatherConditionLabel } from "../utils/weatherCodes.js";

interface TripRequestBody {
  origin: string;
  destination: string;
  departureTime: string;
  departureTimeZone?: string;
  departureTimeZoneOffsetMinutes?: number;
  checkpointMiles?: number;
  rainSensitivity?: "low" | "medium" | "high";
}

function parseDatetimeLocal(value: string) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute)
  };
}

function convertLocalDateTimeToUtc(
  localDateTime: string,
  offsetMinutes: number
) {
  const parts = parseDatetimeLocal(localDateTime);

  if (!parts) {
    return null;
  }

  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute) +
      offsetMinutes * 60 * 1000
  );
}

function formatLocalDateTimeLabel(localDateTime: string) {
  const parts = parseDatetimeLocal(localDateTime);

  if (!parts) {
    return localDateTime;
  }

  const displayDate = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
  );

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC"
  }).format(displayDate);
}

function getTimeZoneAbbreviation(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short"
  }).formatToParts(date);

  return (
    parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone
  );
}

function formatCheckpointArrivalLabel(date: Date, timeZone: string) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(date);

  const timeZoneAbbreviation = getTimeZoneAbbreviation(date, timeZone);

  return {
    arrivalTimeLabel: `${formatted} ${timeZoneAbbreviation}`,
    timeZoneAbbreviation
  };
}

export const tripRouter = Router();

tripRouter.post("/", async (request, response, next) => {
  try {
    const {
      origin,
      destination,
      departureTime,
      departureTimeZone,
      departureTimeZoneOffsetMinutes,
      checkpointMiles = 50,
      rainSensitivity = "medium"
    } = request.body as TripRequestBody;

    if (!origin || !destination || !departureTime) {
      response.status(400).json({
        error: "Origin, destination, and departureTime are required."
      });
      return;
    }

    if (checkpointMiles <= 0) {
      response.status(400).json({
        error: "checkpointMiles must be greater than zero."
      });
      return;
    }

    if (!["low", "medium", "high"].includes(rainSensitivity)) {
      response.status(400).json({
        error: "rainSensitivity must be one of: low, medium, high."
      });
      return;
    }

    if (typeof departureTimeZoneOffsetMinutes !== "number") {
      response.status(400).json({
        error: "departureTimeZoneOffsetMinutes is required."
      });
      return;
    }

    const departureDate = convertLocalDateTimeToUtc(
      departureTime,
      departureTimeZoneOffsetMinutes
    );
    if (!departureDate || Number.isNaN(departureDate.getTime())) {
      response.status(400).json({
        error: "departureTime must be a valid datetime-local value."
      });
      return;
    }

    const forecastWindowEnd = new Date();
    forecastWindowEnd.setUTCDate(forecastWindowEnd.getUTCDate() + 7);
    if (departureDate > forecastWindowEnd) {
      response.status(400).json({
        error:
          "departureTime is beyond the National Weather Service hourly forecast window. Choose a trip within the next 7 days."
      });
      return;
    }

    const [originPoint, destinationPoint] = await Promise.all([
      geocodeLocation(origin),
      geocodeLocation(destination)
    ]);

    const route = await getDrivingRoute(originPoint, destinationPoint);
    const checkpoints = createCheckpoints({
      checkpointMiles,
      departureTime: departureDate,
      routeCoordinates: route.coordinates,
      totalDistanceMiles: route.totalDistanceMiles,
      totalDurationMinutes: route.totalDurationMinutes
    });

    const enrichedCheckpoints: Array<{
      lat: number;
      lng: number;
      distanceMiles: number;
      estimatedArrivalTime: string;
      arrivalTimeLabel: string;
      timeZone: string;
      timeZoneAbbreviation: string;
      temperature: number;
      precipitationProbability: number;
      condition: string;
      riskLevel: "safe" | "possible" | "likely" | "severe";
      advice: string;
    }> = [];

    for (const checkpoint of checkpoints) {
      const forecast = await getForecastForTime(
        checkpoint.lat,
        checkpoint.lng,
        checkpoint.estimatedArrivalTime
      );

      const riskLevel = getRiskLevel({
        precipitationProbability: forecast.precipitationProbability,
        rainSensitivity,
        condition: forecast.condition
      });

      const condition = getWeatherConditionLabel(forecast.condition);
      const checkpointDate = new Date(checkpoint.estimatedArrivalTime);
      const displayTimeZone =
        checkpoint.distanceMiles === 0 && departureTimeZone
          ? departureTimeZone
          : forecast.timeZone;
      const { arrivalTimeLabel, timeZoneAbbreviation } =
        checkpoint.distanceMiles === 0 && departureTimeZone
          ? {
              arrivalTimeLabel: `${formatLocalDateTimeLabel(departureTime)} ${getTimeZoneAbbreviation(
                departureDate,
                departureTimeZone
              )}`,
              timeZoneAbbreviation: getTimeZoneAbbreviation(
                departureDate,
                departureTimeZone
              )
            }
          : formatCheckpointArrivalLabel(checkpointDate, displayTimeZone);

      enrichedCheckpoints.push({
        ...checkpoint,
        arrivalTimeLabel,
        timeZone: displayTimeZone,
        timeZoneAbbreviation,
        temperature: forecast.temperature,
        precipitationProbability: forecast.precipitationProbability,
        condition,
        riskLevel,
        advice: getCheckpointAdvice(riskLevel)
      });
    }

    response.json({
      summary: buildRiskSummary({
        checkpoints: enrichedCheckpoints,
        totalDistanceMiles: route.totalDistanceMiles,
        totalDurationMinutes: route.totalDurationMinutes
      }),
      route: {
        coordinates: route.coordinates
      },
      checkpoints: enrichedCheckpoints
    });
  } catch (error) {
    if (error instanceof OutsideUnitedStatesError) {
      response.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
});
