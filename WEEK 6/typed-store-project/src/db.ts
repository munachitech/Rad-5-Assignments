import "dotenv/config";
import { PrismaClient } from "@prisma/client";

if (!process.env["DATABASE_URL"]) {
  throw new Error("DATABASE_URL is missing from .env");
}

export const prisma = new PrismaClient();