interface GeoPoint {
  lat: number;
  lng: number;
}

interface GeocodeResponse {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
  }>;
}

interface AutocompleteResponse {
  features?: Array<{
    geometry: {
      coordinates: [number, number];
    };
    properties: {
      label: string;
      name: string;
    };
  }>;
}

interface DirectionsGeoJsonResponse {
  features?: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    properties: {
      summary: {
        distance: number;
        duration: number;
      };
    };
  }>;
}

const assertApiKey = () => {
  const openRouteServiceApiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!openRouteServiceApiKey) {
    throw new Error(
      "OPENROUTESERVICE_API_KEY is missing. Add it to your environment before requesting trip data."
    );
  }

  return openRouteServiceApiKey;
};

export async function geocodeLocation(query: string): Promise<GeoPoint> {
  const openRouteServiceApiKey = assertApiKey();

  const url = new URL("https://api.openrouteservice.org/geocode/search");
  url.searchParams.set("api_key", openRouteServiceApiKey);
  url.searchParams.set("text", query);
  url.searchParams.set("size", "1");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenRouteService geocoding failed for "${query}".`);
  }

  const data = (await response.json()) as GeocodeResponse;
  const coordinates = data.features?.[0]?.geometry.coordinates;

  if (!coordinates) {
    throw new Error(`No location match found for "${query}".`);
  }

  return {
    lat: coordinates[1],
    lng: coordinates[0]
  };
}

export async function autocompleteLocation(text: string): Promise<
  Array<{
    label: string;
    name: string;
    coordinates: [number, number];
  }>
> {
  const openRouteServiceApiKey = assertApiKey();

  const url = new URL("https://api.openrouteservice.org/geocode/autocomplete");
  url.searchParams.set("api_key", openRouteServiceApiKey);
  url.searchParams.set("text", text);
  url.searchParams.set("size", "5");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OpenRouteService autocomplete failed for "${text}".`);
  }

  const data = (await response.json()) as AutocompleteResponse;

  return (data.features ?? []).map((feature) => ({
    label: feature.properties.label,
    name: feature.properties.name,
    coordinates: feature.geometry.coordinates
  }));
}

export async function getDrivingRoute(
  origin: GeoPoint,
  destination: GeoPoint
): Promise<{
  coordinates: Array<[number, number]>;
  totalDistanceMiles: number;
  totalDurationMinutes: number;
}> {
  const openRouteServiceApiKey = assertApiKey();

  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: openRouteServiceApiKey
      },
      body: JSON.stringify({
        coordinates: [
          [origin.lng, origin.lat],
          [destination.lng, destination.lat]
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error("OpenRouteService directions lookup failed.");
  }

  const data = (await response.json()) as DirectionsGeoJsonResponse;
  const feature = data.features?.[0];

  if (!feature) {
    throw new Error("No route could be generated for this trip.");
  }

  return {
    coordinates: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    totalDistanceMiles: feature.properties.summary.distance * 0.000621371,
    totalDurationMinutes: feature.properties.summary.duration / 60
  };
}
