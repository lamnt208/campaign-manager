import dotenv from "dotenv";
dotenv.config();

import sequelize from "./config/database";
import "./models";
import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  await sequelize.authenticate();
  console.log("database connected");

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("failed to start server:", err);
  process.exit(1);
});
