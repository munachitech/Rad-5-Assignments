import { Request } from "express";

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface User {
  id: number;
  username: string;
  passwordHash: string;
}
export type PublicUser = Omit<User, "passwordHash">;
export interface LoginResponse {
  token: string;
  user: PublicUser;
}
export interface AuthRequest extends Request {
  userId?: number;
}