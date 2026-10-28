import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";
import { ApiError } from "../utils/api-error";
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
  _res: Response,
  next: NextFunction,
): void {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];

  if (!token) {
    next(new ApiError(401, "A valid bearer token is required."));
    return;
  }

  const secret = getJwtSecret();
  let payload: string | JwtPayload;

  try {
    payload = jwt.verify(token, secret);
  } catch {
    next(new ApiError(401, "The authentication token is invalid or expired."));
    return;
  }

  if (!isAuthPayload(payload)) {
    next(new ApiError(401, "The authentication token is invalid."));
    return;
  }

  req.auth = { userId: payload.sub, role: payload.role };
  next();
}