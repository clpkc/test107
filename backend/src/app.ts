import express from "express";
import { createApiRouter } from "./api/router";
import { PickService } from "./services/pickService";
import { OverpassRestaurantProvider } from "./providers/OverpassRestaurantProvider";

export function createApp(): express.Express {
  const app = express();
  const provider = new OverpassRestaurantProvider();
  const pickService = new PickService(provider);

  app.use(express.json());
  app.use("/api", createApiRouter(pickService));

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "0.0.0.0";
  app.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on ${host}:${port}`);
  });
}
