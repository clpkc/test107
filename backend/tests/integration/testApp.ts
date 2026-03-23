import express from "express";
import { createApiRouter } from "../../src/api/router";
import { PickService } from "../../src/services/pickService";
import type { RestaurantProvider } from "../../src/providers/RestaurantProvider";

export function buildTestApp(provider: RestaurantProvider, rng: () => number = Math.random) {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRouter(new PickService(provider, rng)));
  return app;
}
