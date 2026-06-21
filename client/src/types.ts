export type RainSensitivity = "low" | "medium" | "high";

export interface TripRequest {
  origin: string;
  destination: string;
  departureTime: string;
  checkpointMiles: number;
  rainSensitivity: RainSensitivity;
}

export interface AddressSuggestion {
  label: string;
  name: string;
  coordinates: [number, number];
}

export interface TripSummary {
  totalDistanceMiles: number;
  totalDurationMinutes: number;
  overallRisk: "safe" | "possible" | "likely" | "severe";
  recommendation: string;
}

export interface RoutePayload {
  coordinates: [number, number][];
}

export interface WeatherCheckpoint {
  lat: number;
  lng: number;
  distanceMiles: number;
  estimatedArrivalTime: string;
  temperature: number;
  precipitationProbability: number;
  condition: string;
  riskLevel: "safe" | "possible" | "likely" | "severe";
  advice: string;
}

export interface TripResponse {
  summary: TripSummary;
  route: RoutePayload;
  checkpoints: WeatherCheckpoint[];
}
