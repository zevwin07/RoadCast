import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { autocompleteLocation } from "./utils/openRouteService.js";
import { tripRouter } from "./routes/trip.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 8787);

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDistCandidates = [
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(currentDir, "../../client/dist"),
  path.resolve(currentDir, "../client/dist")
];

const clientDistPath =
  clientDistCandidates.find((candidate) => fs.existsSync(candidate)) ??
  clientDistCandidates[0];

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/autocomplete", async (request, response, next) => {
  try {
    const text = typeof request.query.text === "string" ? request.query.text.trim() : "";

    if (text.length < 3) {
      response.json([]);
      return;
    }

    const suggestions = await autocompleteLocation(text);
    response.json(suggestions);
  } catch (error) {
    next(error);
  }
});

app.use("/api/trip", tripRouter);

app.use(express.static(clientDistPath));

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api/")) {
    next();
    return;
  }

  response.sendFile(path.join(clientDistPath, "index.html"));
});

app.use(
  (
    error: Error,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    response.status(500).json({
      error: error.message || "Unexpected server error."
    });
  }
);

app.listen(port, () => {
  console.log(`RoadCast server listening on http://localhost:${port}`);
});
