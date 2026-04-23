import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import sequelize from "../src/config/database";
import { User, Campaign, Recipient, CampaignRecipient } from "../src/models";

async function seed() {
  await sequelize.authenticate();
  console.log("connected");

  const passwordHash = await bcrypt.hash("password123", 10);

  const [user] = await User.findOrCreate({
    where: { email: "admin@example.com" },
    defaults: {
      email: "admin@example.com",
      name: "Admin User",
      password_hash: passwordHash,
    },
  });
  console.log(`user: ${user.email}`);

  await User.findOrCreate({
    where: { email: "marketer@example.com" },
    defaults: {
      email: "marketer@example.com",
      name: "Marketer User",
      password_hash: passwordHash,
    },
  });
  console.log("user: marketer@example.com");

  const recipientData = [
    { email: "alice@example.com", name: "Alice Johnson" },
    { email: "bob@example.com", name: "Bob Smith" },
    { email: "carol@example.com", name: "Carol White" },
  ];

  const recipients: Recipient[] = [];
  for (const data of recipientData) {
    const [r] = await Recipient.findOrCreate({
      where: { email: data.email },
      defaults: data,
    });
    recipients.push(r);
    console.log(`recipient: ${r.email}`);
  }

  const [draft] = await Campaign.findOrCreate({
    where: { name: "Welcome Series", created_by: user.id },
    defaults: {
      name: "Welcome Series",
      subject: "Welcome to our platform!",
      body: "Hi there, thanks for signing up. We are thrilled to have you.",
      status: "draft",
      created_by: user.id,
    },
  });
  console.log(`draft campaign: ${draft.id}`);

  for (const r of recipients) {
    await CampaignRecipient.findOrCreate({
      where: { campaign_id: draft.id, recipient_id: r.id },
      defaults: { campaign_id: draft.id, recipient_id: r.id },
    });
  }

  const [sent] = await Campaign.findOrCreate({
    where: { name: "Product Announcement", created_by: user.id },
    defaults: {
      name: "Product Announcement",
      subject: "Exciting new features just launched",
      body: "We shipped a huge update today. Here is what is new...",
      status: "sent",
      created_by: user.id,
    },
  });
  console.log(`sent campaign: ${sent.id}`);

  const outcomes: Array<"sent" | "failed"> = ["sent", "sent", "failed"];
  for (let i = 0; i < recipients.length; i++) {
    await CampaignRecipient.findOrCreate({
      where: { campaign_id: sent.id, recipient_id: recipients[i].id },
      defaults: {
        campaign_id: sent.id,
        recipient_id: recipients[i].id,
        status: outcomes[i],
        sent_at: outcomes[i] === "sent" ? new Date() : null,
        opened_at: i === 0 ? new Date() : null,
      },
    });
  }

  console.log("seed complete");
  await sequelize.close();
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
