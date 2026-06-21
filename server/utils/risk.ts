interface RiskArgs {
  precipitationProbability: number;
  rainSensitivity: "low" | "medium" | "high";
  weatherCode: number;
}

interface SummaryArgs {
  checkpoints: Array<{
    riskLevel: "safe" | "possible" | "likely" | "severe";
  }>;
  totalDistanceMiles: number;
  totalDurationMinutes: number;
}

const likelyThresholdBySensitivity = {
  low: 70,
  medium: 50,
  high: 30
} as const;

const severityRank = {
  safe: 0,
  possible: 1,
  likely: 2,
  severe: 3
} as const;

export function getRiskLevel({
  precipitationProbability,
  rainSensitivity,
  weatherCode
}: RiskArgs): "safe" | "possible" | "likely" | "severe" {
  if ([95, 96, 99].includes(weatherCode)) {
    return "severe";
  }

  const likelyThreshold = likelyThresholdBySensitivity[rainSensitivity];
  const possibleThreshold = likelyThreshold / 2;

  if (precipitationProbability >= likelyThreshold) {
    return "likely";
  }

  if (precipitationProbability >= possibleThreshold) {
    return "possible";
  }

  return "safe";
}

export function getCheckpointAdvice(
  riskLevel: "safe" | "possible" | "likely" | "severe"
) {
  switch (riskLevel) {
    case "safe":
      return "Looks dry here.";
    case "possible":
      return "Rain is possible around this part of the drive.";
    case "likely":
      return "Cover the truck bed before this segment.";
    case "severe":
      return "Severe weather may affect this part of the trip.";
    default:
      return "Monitor the forecast as you travel.";
  }
}

export function buildRiskSummary({
  checkpoints,
  totalDistanceMiles,
  totalDurationMinutes
}: SummaryArgs) {
  const overallRisk = checkpoints.reduce<
    "safe" | "possible" | "likely" | "severe"
  >((highest, checkpoint) => {
    return severityRank[checkpoint.riskLevel] > severityRank[highest]
      ? checkpoint.riskLevel
      : highest;
  }, "safe");

  const recommendationByRisk = {
    safe: "The route looks mostly dry. Normal cargo precautions should be enough.",
    possible:
      "A few segments may see rain. Keep a tarp or cover handy during the drive.",
    likely:
      "Rain is likely somewhere along the route. Cover exposed cargo before departure.",
    severe:
      "Storm activity is in the forecast. Consider delaying, rerouting, or adding extra protection."
  } as const;

  return {
    totalDistanceMiles: Number(totalDistanceMiles.toFixed(1)),
    totalDurationMinutes: Number(totalDurationMinutes.toFixed(0)),
    overallRisk,
    recommendation: recommendationByRisk[overallRisk]
  };
}
