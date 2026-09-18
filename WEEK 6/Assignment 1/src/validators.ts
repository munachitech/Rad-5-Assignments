import { User } from "./models";

export function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) return false;

  const v = value as Record<string, unknown>;

  return (
    typeof v.id === "number" &&
    typeof v.name === "string" &&
    typeof v.email === "string" &&
    (v.role === "admin" ||
      v.role === "editor" ||
      v.role === "viewer")
  );
}