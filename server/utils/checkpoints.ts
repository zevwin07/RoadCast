interface CreateCheckpointArgs {
  checkpointMiles: number;
  departureTime: Date;
  routeCoordinates: Array<[number, number]>;
  totalDistanceMiles: number;
  totalDurationMinutes: number;
}

interface BaseCheckpoint {
  lat: number;
  lng: number;
  distanceMiles: number;
  estimatedArrivalTime: string;
}

const earthRadiusMiles = 3958.8;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function haversineMiles(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

function interpolatePoint(
  [startLat, startLng]: [number, number],
  [endLat, endLng]: [number, number],
  ratio: number
): [number, number] {
  return [
    startLat + (endLat - startLat) * ratio,
    startLng + (endLng - startLng) * ratio
  ];
}

export function createCheckpoints({
  checkpointMiles,
  departureTime,
  routeCoordinates,
  totalDistanceMiles,
  totalDurationMinutes
}: CreateCheckpointArgs): BaseCheckpoint[] {
  if (routeCoordinates.length < 2) {
    return [];
  }

  const targets: number[] = [0];
  let nextDistance = checkpointMiles;

  while (nextDistance < totalDistanceMiles) {
    targets.push(nextDistance);
    nextDistance += checkpointMiles;
  }

  if (targets[targets.length - 1] !== totalDistanceMiles) {
    targets.push(totalDistanceMiles);
  }

  const checkpoints: BaseCheckpoint[] = [];
  let currentTargetIndex = 0;
  let traveledMiles = 0;

  for (let index = 1; index < routeCoordinates.length; index += 1) {
    const start = routeCoordinates[index - 1];
    const end = routeCoordinates[index];
    const segmentMiles = haversineMiles(start, end);
    const segmentEndMiles = traveledMiles + segmentMiles;

    while (
      currentTargetIndex < targets.length &&
      targets[currentTargetIndex] <= segmentEndMiles + 1e-6
    ) {
      const targetMiles = targets[currentTargetIndex];
      const ratio =
        segmentMiles === 0 ? 0 : (targetMiles - traveledMiles) / segmentMiles;
      const [lat, lng] = interpolatePoint(start, end, Math.max(0, Math.min(1, ratio)));
      const minutesIntoDrive =
        totalDistanceMiles === 0
          ? 0
          : (targetMiles / totalDistanceMiles) * totalDurationMinutes;

      checkpoints.push({
        lat,
        lng,
        distanceMiles: Number(targetMiles.toFixed(1)),
        estimatedArrivalTime: new Date(
          departureTime.getTime() + minutesIntoDrive * 60 * 1000
        ).toISOString()
      });

      currentTargetIndex += 1;
    }

    traveledMiles = segmentEndMiles;
  }

  return checkpoints;
}
