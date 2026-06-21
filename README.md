# RoadCast

RoadCast is a road trip weather planner that checks forecast conditions along a driving route based on where the driver is likely to be at different times. The main use case is protecting belongings in an open pickup truck bed from rain during a trip.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Leaflet + React Leaflet
- OpenStreetMap tiles
- Node + Express
- OpenRouteService for geocoding and directions
- National Weather Service API for forecasts

## Project Structure

```text
client/
  src/
    App.tsx
    components/
      RouteMap.tsx
      SummaryCard.tsx
      TripForm.tsx
      WeatherCheckpointCard.tsx
      WeatherTimeline.tsx
    types.ts
server/
  index.ts
  routes/
    trip.ts
  utils/
    checkpoints.ts
    nws.ts
    openRouteService.ts
    risk.ts
    weatherCodes.ts
```

## Environment Variables

Create a root `.env` file:

```bash
OPENROUTESERVICE_API_KEY=your_key_here
```

The National Weather Service API does not require an API key, but it only covers the United States.

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Start the app in development:

```bash
npm run dev
```

3. Open the frontend at [http://localhost:5173](http://localhost:5173).

The Express API runs at [http://localhost:8787](http://localhost:8787) and Vite proxies `/api` requests there in development.

## Build and Run

```bash
npm run build
npm run start
```

After building, the Express server serves the frontend from `client/dist` in production.

## Render Deployment

RoadCast can be deployed to Render as a single Node web service.

1. Push the repository to GitHub.
2. In Render, create a new `Web Service`.
3. Connect the GitHub repository.
4. Use these settings:

```text
Environment: Node
Build Command: npm run build
Start Command: npm start
```

5. Add this environment variable in Render:

```text
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key
```

6. Deploy the service.

Notes for Render:

- Keep `OPENROUTESERVICE_API_KEY` configured only on the server as an environment variable. It is never exposed in frontend code.
- Render will provide `PORT`, and the Express server will use it automatically.
- The production server serves the built Vite app from `client/dist`, so this deploys as one full-stack service rather than separate frontend and backend apps.

## API

### `POST /api/trip`

Request body:

```json
{
  "origin": "Austin, TX",
  "destination": "Houston, TX",
  "departureTime": "2026-06-21T09:00",
  "departureTimeZone": "America/Chicago",
  "departureTimeZoneOffsetMinutes": 300,
  "checkpointMiles": 50,
  "rainSensitivity": "medium"
}
```

### `GET /api/autocomplete?text=aus`

Returns up to 5 OpenRouteService address suggestions from the backend, keeping the API key off the client.

Example response:

```json
[
  {
    "label": "Austin, TX, United States of America",
    "name": "Austin",
    "coordinates": [-97.7431, 30.2672]
  }
]
```

Response shape:

```json
{
  "summary": {
    "totalDistanceMiles": 165.2,
    "totalDurationMinutes": 159,
    "overallRisk": "possible",
    "recommendation": "A few segments may see rain. Keep a tarp or cover handy during the drive."
  },
  "route": {
    "coordinates": [[30.2672, -97.7431], [29.7604, -95.3698]]
  },
  "checkpoints": [
    {
      "lat": 30.12,
      "lng": -97.31,
      "distanceMiles": 50,
      "estimatedArrivalTime": "2026-06-21T15:10:00.000Z",
      "arrivalTimeLabel": "6/21/2026, 10:10 AM CDT",
      "timeZone": "America/Chicago",
      "timeZoneAbbreviation": "CDT",
      "temperature": 82,
      "precipitationProbability": 45,
      "condition": "Cloudy",
      "riskLevel": "possible",
      "advice": "Rain is possible around this part of the drive."
    }
  ]
}
```

## Notes

- U.S. routes only. If a route leaves National Weather Service coverage, RoadCast returns a friendly message explaining that only United States trips are supported.
- Checkpoints are generated from the route geometry at the chosen spacing, with the destination always included as the final checkpoint.
- The departure `datetime-local` value is treated as the user's local time. The frontend sends the raw value plus the browser timezone and selected-date offset so the server does not shift it accidentally.
- Arrival times are estimated proportionally from the full route duration returned by OpenRouteService.
- Checkpoint display times include a timezone abbreviation and update as the route crosses time zones.
- Each checkpoint is resolved through the NWS `/points/{lat},{lon}` endpoint to determine its forecast grid and hourly forecast URL.
- Hourly NWS forecast responses are cached by grid ID for 30 minutes, so multiple checkpoints in the same grid reuse the same forecast payload.
- Risk scoring rules:
  - `severe` when the hourly forecast condition indicates thunderstorms or storms
  - `likely` rain at `70%+` for low sensitivity, `50%+` for medium, `30%+` for high
  - `possible` rain starts at half the likely threshold
  - otherwise `safe`

## MVP Behavior

- Plan a route from free-form origin and destination text
- Visualize the route on a Leaflet map
- Show a top-level route risk summary
- Render weather checkpoint cards in drive order
- Tailor recommendations to cargo-exposure concerns
