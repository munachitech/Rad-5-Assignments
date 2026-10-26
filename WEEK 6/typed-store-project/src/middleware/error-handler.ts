import type { ErrorRequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../utils/api-error";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (res.headersSent) return;

  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        error: "A record with that value already exists.",
      });
      return;
    }

    if (error.code === "P2003") {
      res.status(409).json({
        error: "The record cannot be deleted because it is in use.",
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({ error: "Record not found." });
      return;
    }
  }

  console.error("API request failed:", error);
  res.status(500).json({
    error: "An unexpected server error occurred.",
  });
};