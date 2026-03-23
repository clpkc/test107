import { Router } from "express";
import { z } from "zod";
import { PickService, PickError } from "../services/pickService";
import type { ApiErrorBody } from "../models/restaurant";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(1).max(1000).default(1000),
});

export function createPickRoute(service: PickService): Router {
  const router = Router();

  router.get("/pick", async (req, res) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      const body: ApiErrorBody = { code: "invalid_input", message: "Invalid location or radius" };
      return res.status(400).json(body);
    }

    try {
      const result = await service.pick(parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof PickError) {
        const mapping: Record<string, number> = {
          no_results: 404,
          source_unavailable: 502,
          parsing_failure: 503,
          rate_limited: 429,
        };
        const status = mapping[error.code] ?? 503;
        const body: ApiErrorBody = { code: error.code, message: error.message };
        return res.status(status).json(body);
      }
      const body: ApiErrorBody = { code: "parsing_failure", message: "Unexpected failure" };
      return res.status(503).json(body);
    }
  });

  return router;
}
