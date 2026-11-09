// Zod schemas: rules for what data is allowed
import { z } from "zod";

const statusValues = ["TODO", "IN_PROGRESS", "DONE"];
const reminderTypes = ["DEADLINE", "STUDY", "MOTIVATION"];

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(statusValues).optional(),
});

// For updates, every field is optional
export const updateTaskSchema = createTaskSchema.partial();

export const createReminderSchema = z.object({
  message: z.string().min(1, "Message is required").max(200),
  type: z.enum(reminderTypes).optional(),
  remindAt: z.coerce.date({ invalid_type_error: "remindAt must be a valid date" }),
  taskId: z.number().int().optional(),
});

export const updateReminderSchema = createReminderSchema.partial().extend({
  done: z.boolean().optional(),
});
