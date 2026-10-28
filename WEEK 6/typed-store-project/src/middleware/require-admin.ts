import type { Request, Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/client";
import { ApiError } from "../utils/api-error";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.auth) {
    next(new ApiError(401, "Authentication is required."));
    return;
  }

  if (req.auth.role !== Role.ADMIN) {
    next(new ApiError(403, "Administrator access is required."));
    return;
  }

  next();
}