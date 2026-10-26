import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";
import { getJwtSecret } from "../utils/jwt-secret";

function isAuthPayload(
  payload: string | JwtPayload,
): payload is JwtPayload & { sub: string; role: Role } {
  return (
    typeof payload !== "string" &&
    typeof payload.sub === "string" &&
    payload.sub.length > 0 &&
    (payload.role === Role.CUSTOMER || payload.role === Role.ADMIN)
  );
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];

  if (!token) {
    res.status(401).json({ error: "A valid bearer token is required." });
    return;
  }

  let payload: string | JwtPayload;

  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    res.status(401).json({
      error: "The authentication token is invalid or expired.",
    });
    return;
  }

  if (!isAuthPayload(payload)) {
    res.status(401).json({ error: "The authentication token is invalid." });
    return;
  }

  req.auth = { userId: payload.sub, role: payload.role };
  next();
}