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
  checkpointMiles?: number;
  rainSensitivity?: "low" | "medium" | "high";
}

export const tripRouter = Router();

tripRouter.post("/", async (request, response, next) => {
  try {
    const {
      origin,
      destination,
      departureTime,
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

    const departureDate = new Date(departureTime);
    if (Number.isNaN(departureDate.getTime())) {
      response.status(400).json({
        error: "departureTime must be a valid ISO date-time string."
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

      enrichedCheckpoints.push({
        ...checkpoint,
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
