import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  listCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  scheduleCampaign,
  sendCampaign,
  getCampaignStats,
} from "../controllers/campaignController";

const router = Router();

router.use(requireAuth);

router.get("/", listCampaigns);
router.post("/", createCampaign);
router.get("/:id", getCampaign);
router.patch("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);
router.post("/:id/schedule", scheduleCampaign);
router.post("/:id/send", sendCampaign);
router.get("/:id/stats", getCampaignStats);

export default router;
