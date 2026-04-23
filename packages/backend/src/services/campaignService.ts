import { Campaign, CampaignRecipient } from "../models";
import { AppError } from "../middleware/errorHandler";

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export async function getStats(campaignId: string): Promise<CampaignStats> {
  const rows = await CampaignRecipient.findAll({
    where: { campaign_id: campaignId },
    attributes: ["status", "opened_at"],
  });

  const total = rows.length;
  const sent = rows.filter((r) => r.status === "sent").length;
  const failed = rows.filter((r) => r.status === "failed").length;
  const opened = rows.filter((r) => r.opened_at !== null).length;

  return {
    total,
    sent,
    failed,
    opened,
    open_rate: sent > 0 ? opened / sent : 0,
    send_rate: total > 0 ? sent / total : 0,
  };
}

export async function assertDraftStatus(campaignId: string, userId: string) {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, created_by: userId },
  });
  if (!campaign) {
    throw new AppError(404, "campaign not found");
  }
  if (campaign.status !== "draft") {
    throw new AppError(403, "campaign can only be modified when status is draft");
  }
  return campaign;
}

export async function getCampaignOrThrow(campaignId: string, userId: string) {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, created_by: userId },
    include: [
      {
        association: "campaignRecipients",
        include: [{ association: "recipient" }],
      },
    ],
  });
  if (!campaign) {
    throw new AppError(404, "campaign not found");
  }
  return campaign;
}

export async function addRecipientsToCampaign(campaignId: string, recipientIds: string[]) {
  if (recipientIds.length === 0) return;

  const existing = await CampaignRecipient.findAll({
    where: { campaign_id: campaignId },
    attributes: ["recipient_id"],
  });
  const existingIds = new Set(existing.map((r) => r.recipient_id));

  const toInsert = recipientIds
    .filter((id) => !existingIds.has(id))
    .map((id) => ({ campaign_id: campaignId, recipient_id: id }));

  if (toInsert.length > 0) {
    await CampaignRecipient.bulkCreate(toInsert);
  }
}
