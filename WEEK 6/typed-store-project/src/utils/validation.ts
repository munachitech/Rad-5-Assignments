import type { Response } from "express";
import { z, type ZodIssue } from "zod";

export const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, {
  message: "Invalid ID.",
});

export function sendValidationError(
  res: Response,
  issues: ZodIssue[],
): void {
  res.status(400).json({
    error: "Invalid request data.",
    details: issues,
  });
}