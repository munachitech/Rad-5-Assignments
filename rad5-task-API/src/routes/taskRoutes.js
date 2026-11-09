import { Router } from "express";
import {
  getTasks, getTask, createTask, updateTask, deleteTask,
} from "../controllers/taskController.js";
import protect from "../middlewares/authMiddleware.js";
import { validate, checkId } from "../middlewares/validate.js";
import { createTaskSchema, updateTaskSchema } from "../validators/schemas.js";

const router = Router();

router.use(protect); // every task route needs a login

router.get("/", getTasks);
router.get("/:id", checkId, getTask);
router.post("/", validate(createTaskSchema), createTask);
router.put("/:id", checkId, validate(updateTaskSchema), updateTask);
router.delete("/:id", checkId, deleteTask);

export default router;
