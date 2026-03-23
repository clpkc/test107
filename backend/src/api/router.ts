import { Router } from "express";
import { createPickRoute } from "./pickRoute";
import { PickService } from "../services/pickService";

export function createApiRouter(service: PickService): Router {
  const router = Router();
  router.use(createPickRoute(service));
  return router;
}
