import { Router } from "express";
import {
  getReminders, getDueReminders, createReminder, updateReminder, deleteReminder,
} from "../controllers/reminderController.js";
import protect from "../middlewares/authMiddleware.js";
import { validate, checkId } from "../middlewares/validate.js";
import { createReminderSchema, updateReminderSchema } from "../validators/schemas.js";

const router = Router();

router.use(protect);

router.get("/", getReminders);
router.get("/due", getDueReminders); // must come before "/:id"
router.post("/", validate(createReminderSchema), createReminder);
router.put("/:id", checkId, validate(updateReminderSchema), updateReminder);
router.delete("/:id", checkId, deleteReminder);

export default router;
