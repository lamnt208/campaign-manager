import request from "supertest";
import { app, setupDatabase, teardownDatabase, registerAndLogin } from "./helpers";

let token: string;
let campaignId: string;

beforeAll(async () => {
  await setupDatabase();
  token = await registerAndLogin("campaigns@example.com", "password123", "Campaigns User");
});

afterAll(teardownDatabase);

describe("POST /campaigns", () => {
  it("creates a campaign", async () => {
    const res = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "My Campaign", subject: "Hello", body: "Body text" });

    expect(res.status).toBe(201);
    expect(res.body.campaign.status).toBe("draft");
    campaignId = res.body.campaign.id;
  });

  it("returns 401 without token", async () => {
    const res = await request(app)
      .post("/campaigns")
      .send({ name: "Test", subject: "Sub", body: "Body" });
    expect(res.status).toBe(401);
  });
});

describe("PATCH /campaigns/:id", () => {
  it("updates a draft campaign", async () => {
    const res = await request(app)
      .patch(`/campaigns/${campaignId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.campaign.name).toBe("Updated Name");
  });

  it("rejects update on non-draft campaign", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Schedule", subject: "Sub", body: "Body" });

    const cId = createRes.body.campaign.id;
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    await request(app)
      .post(`/campaigns/${cId}/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduled_at: futureDate });

    const res = await request(app)
      .patch(`/campaigns/${cId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Cannot Update" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /campaigns/:id", () => {
  it("deletes a draft campaign", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "To Delete", subject: "Sub", body: "Body" });

    const res = await request(app)
      .delete(`/campaigns/${createRes.body.campaign.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("rejects delete on non-draft campaign", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "No Delete", subject: "Sub", body: "Body" });

    const cId = createRes.body.campaign.id;
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    await request(app)
      .post(`/campaigns/${cId}/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduled_at: futureDate });

    const res = await request(app)
      .delete(`/campaigns/${cId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("POST /campaigns/:id/schedule", () => {
  it("rejects a past timestamp", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Schedule Test", subject: "Sub", body: "Body" });

    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const res = await request(app)
      .post(`/campaigns/${createRes.body.campaign.id}/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduled_at: pastDate });

    expect(res.status).toBe(400);
  });

  it("schedules with a future timestamp", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Schedule OK", subject: "Sub", body: "Body" });

    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .post(`/campaigns/${createRes.body.campaign.id}/schedule`)
      .set("Authorization", `Bearer ${token}`)
      .send({ scheduled_at: futureDate });

    expect(res.status).toBe(200);
    expect(res.body.campaign.status).toBe("scheduled");
  });
});
