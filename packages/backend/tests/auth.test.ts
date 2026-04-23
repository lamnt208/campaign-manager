import request from "supertest";
import { app, setupDatabase, teardownDatabase } from "./helpers";

beforeAll(setupDatabase);
afterAll(teardownDatabase);

describe("POST /auth/register", () => {
  it("creates a user and returns a JWT", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "register@example.com",
      name: "Alice",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("register@example.com");
  });

  it("returns 409 on duplicate email", async () => {
    await request(app).post("/auth/register").send({
      email: "dup@example.com",
      name: "Bob",
      password: "password123",
    });
    const res = await request(app).post("/auth/register").send({
      email: "dup@example.com",
      name: "Bob2",
      password: "password123",
    });
    expect(res.status).toBe(409);
  });

  it("returns 400 on invalid payload", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "not-an-email",
      name: "",
      password: "short",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  beforeAll(async () => {
    await request(app).post("/auth/register").send({
      email: "login@example.com",
      name: "Carol",
      password: "password123",
    });
  });

  it("returns a JWT with valid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("returns 401 with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "login@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
  });
});
