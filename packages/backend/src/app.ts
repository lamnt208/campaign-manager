import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import campaignRoutes from "./routes/campaigns";
import recipientRoutes from "./routes/recipients";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/auth", authRoutes);
  app.use("/campaigns", campaignRoutes);
  app.use("/recipients", recipientRoutes);
  app.use("/recipient", recipientRoutes);

  app.use(errorHandler);

  return app;
}
