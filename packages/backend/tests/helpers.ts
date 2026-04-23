import request from "supertest";
import { createApp } from "../src/app";
import sequelize from "../src/config/database";
import "../src/models";

export const app = createApp();

export async function setupDatabase() {
  await sequelize.authenticate();
  await sequelize.query("SET session_replication_role = replica");
  await sequelize.query("TRUNCATE TABLE campaign_recipients, campaigns, recipients, users RESTART IDENTITY CASCADE");
  await sequelize.query("SET session_replication_role = DEFAULT");
}

export async function teardownDatabase() {
  await sequelize.close();
}

export async function registerAndLogin(
  email = "test@example.com",
  password = "password123",
  name = "Test User"
) {
  await request(app).post("/auth/register").send({ email, password, name });
  const res = await request(app).post("/auth/login").send({ email, password });
  return res.body.token as string;
}
