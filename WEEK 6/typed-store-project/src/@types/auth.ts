import type { Role } from "../../generated/prisma/client";

export interface AuthContext {
  userId: string;
  role: Role;
}