import type { Role } from "@prisma/client";

export interface AuthContext {
  userId: string;
  role: Role;
}