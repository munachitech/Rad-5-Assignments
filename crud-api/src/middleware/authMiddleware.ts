import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/index.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      message: "Authentication token required"
    });
    return;
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    res.status(401).json({
      message: "Authentication token required"
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
    };

    req.userId = decoded.userId;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};