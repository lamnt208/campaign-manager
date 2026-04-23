import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listRecipients, createRecipient } from "../controllers/recipientController";

const router = Router();

router.use(requireAuth);

router.get("/", listRecipients);
router.post("/", createRecipient);

export default router;
