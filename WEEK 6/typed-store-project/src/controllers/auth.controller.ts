import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";
import { prisma } from "../db";
import {
  registrationSchema,
  loginSchema,
} from "../schemas/auth.schema";
import { ApiError } from "../utils/api-error";
import { getJwtSecret } from "../utils/jwt-secret";

export async function register(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = registrationSchema.parse(req.body);
  const jwtSecret = getJwtSecret();

  const { name, password } = parsed;
  const email = parsed.email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.CUSTOMER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  const token = jwt.sign(
    { role: user.role },
    jwtSecret,
    {
      subject: user.id,
      expiresIn: "1h",
    },
  );

  res.status(201).json({ user, token });
}

export async function login(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = loginSchema.parse(req.body);
  const jwtSecret = getJwtSecret();

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.email.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  if (
    !user ||
    !(await bcrypt.compare(
      parsed.password,
      user.passwordHash,
    ))
  ) {
    throw new ApiError(401, "Email or password is incorrect.");
  }

  const token = jwt.sign(
    { role: user.role },
    jwtSecret,
    {
      subject: user.id,
      expiresIn: "1h",
    },
  );

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
}

export async function getCurrentUser(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.auth) {
    throw new ApiError(401, "Authentication is required.");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.status(200).json(user);
}