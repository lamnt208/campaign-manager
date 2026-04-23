import { Request, Response, NextFunction } from "express";
import { Recipient } from "../models";
import { createRecipientSchema } from "../validators/campaignSchemas";

export async function listRecipients(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const offset = Number(req.query.offset) || 0;

    const { rows: recipients, count } = await Recipient.findAndCountAll({
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.json({ recipients, total: count, limit, offset });
  } catch (err) {
    next(err);
  }
}

export async function createRecipient(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createRecipientSchema.parse(req.body);

    const [recipient, created] = await Recipient.findOrCreate({
      where: { email: input.email },
      defaults: { name: input.name, email: input.email },
    });

    res.status(created ? 201 : 200).json({ recipient });
  } catch (err) {
    next(err);
  }
}
