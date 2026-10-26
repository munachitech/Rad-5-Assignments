import type { Request, Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/client";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }

  if (req.auth.role !== Role.ADMIN) {
    res.status(403).json({
      error: "Administrator access is required.",
    });
    return;
  }

  next();
}