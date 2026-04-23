import { Campaign, CampaignRecipient } from "../models";

const SEND_DELAY_MS = 100;

function randomOutcome(): "sent" | "failed" {
  return Math.random() < 0.8 ? "sent" : "failed";
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateSend(campaignId: string): Promise<void> {
  const rows = await CampaignRecipient.findAll({
    where: { campaign_id: campaignId, status: "pending" },
  });

  for (const row of rows) {
    await delay(SEND_DELAY_MS);
    const outcome = randomOutcome();
    await row.update({
      status: outcome,
      sent_at: outcome === "sent" ? new Date() : null,
    });
  }

  await Campaign.update({ status: "sent", updated_at: new Date() }, { where: { id: campaignId } });
}
