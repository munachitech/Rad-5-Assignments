import type { Response } from "express";
import type { ZodIssue } from "zod";

export function sendValidationError(
  res: Response,
  issues: ZodIssue[],
): void {
  res.status(400).json({
    error: "Invalid request data.",
    details: issues,
  });
}