import request from "supertest";
import { app, setupDatabase, teardownDatabase, registerAndLogin } from "./helpers";

let token: string;

beforeAll(async () => {
  await setupDatabase();
  token = await registerAndLogin("send@example.com", "password123", "Send User");
});

afterAll(teardownDatabase);

describe("POST /campaigns/:id/send", () => {
  it("transitions campaign to sending and returns 202", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Send Me", subject: "Sub", body: "Body" });

    const cId = createRes.body.campaign.id;

    const sendRes = await request(app)
      .post(`/campaigns/${cId}/send`)
      .set("Authorization", `Bearer ${token}`);

    expect(sendRes.status).toBe(202);
    expect(sendRes.body.campaignId).toBe(cId);
  });

  it("rejects sending an already sent campaign", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Send Twice", subject: "Sub", body: "Body" });

    const cId = createRes.body.campaign.id;
    await request(app)
      .post(`/campaigns/${cId}/send`)
      .set("Authorization", `Bearer ${token}`);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const res = await request(app)
      .post(`/campaigns/${cId}/send`)
      .set("Authorization", `Bearer ${token}`);

    expect([403, 409]).toContain(res.status);
  });
});

describe("GET /campaigns/:id/stats", () => {
  it("returns stats with the correct shape", async () => {
    const createRes = await request(app)
      .post("/campaigns")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Stats Test", subject: "Sub", body: "Body" });

    const cId = createRes.body.campaign.id;
    const res = await request(app)
      .get(`/campaigns/${cId}/stats`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: expect.any(Number),
      sent: expect.any(Number),
      failed: expect.any(Number),
      opened: expect.any(Number),
      open_rate: expect.any(Number),
      send_rate: expect.any(Number),
    });
  });
});
