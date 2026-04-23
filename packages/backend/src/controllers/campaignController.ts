import { Request, Response, NextFunction } from "express";
import { Campaign } from "../models";
import {
  createCampaignSchema,
  updateCampaignSchema,
  scheduleSchema,
} from "../validators/campaignSchemas";
import { AppError } from "../middleware/errorHandler";
import { simulateSend } from "../services/sendService";
import {
  getStats,
  assertDraftStatus,
  getCampaignOrThrow,
  addRecipientsToCampaign,
} from "../services/campaignService";

export async function listCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    const { rows: campaigns, count } = await Campaign.findAndCountAll({
      where: { created_by: userId },
      order: [["created_at", "DESC"]],
      limit,
      offset,
      include: [{ association: "campaignRecipients", attributes: ["recipient_id"] }],
      distinct: true,
    });

    const items = campaigns.map((c) => ({
      ...c.toJSON(),
      recipient_count: (c as typeof c & { campaignRecipients: unknown[] }).campaignRecipients
        .length,
    }));

    res.json({ campaigns: items, total: count, limit, offset });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const input = createCampaignSchema.parse(req.body);

    const campaign = await Campaign.create({
      name: input.name,
      subject: input.subject,
      body: input.body,
      created_by: userId,
    });

    await addRecipientsToCampaign(campaign.id, input.recipientIds);

    res.status(201).json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function getCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const campaign = await getCampaignOrThrow(req.params.id, userId);
    const stats = await getStats(campaign.id);
    res.json({ campaign, stats });
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const campaign = await assertDraftStatus(req.params.id, userId);
    const input = updateCampaignSchema.parse(req.body);

    await campaign.update({ ...input, updated_at: new Date() });
    res.json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const campaign = await assertDraftStatus(req.params.id, userId);
    await campaign.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function scheduleCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, created_by: userId },
    });
    if (!campaign) {
      throw new AppError(404, "campaign not found");
    }
    if (campaign.status !== "draft") {
      throw new AppError(403, "only draft campaigns can be scheduled");
    }

    const input = scheduleSchema.parse(req.body);
    await campaign.update({
      scheduled_at: new Date(input.scheduled_at),
      status: "scheduled",
      updated_at: new Date(),
    });

    res.json({ campaign });
  } catch (err) {
    next(err);
  }
}

export async function sendCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, created_by: userId },
    });
    if (!campaign) {
      throw new AppError(404, "campaign not found");
    }
    if (campaign.status === "sent") {
      throw new AppError(403, "campaign has already been sent");
    }
    if (campaign.status === "sending") {
      throw new AppError(409, "campaign is currently being sent");
    }

    await campaign.update({ status: "sending", updated_at: new Date() });

    simulateSend(campaign.id).catch((err) => {
      console.error(`send simulation failed for campaign ${campaign.id}:`, err);
    });

    res.status(202).json({ message: "send initiated", campaignId: campaign.id });
  } catch (err) {
    next(err);
  }
}

export async function getCampaignStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, created_by: userId },
    });
    if (!campaign) {
      throw new AppError(404, "campaign not found");
    }

    const stats = await getStats(campaign.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
