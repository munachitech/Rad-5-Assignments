import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role } from "../../generated/prisma/client";
import { prisma } from "../db";
import {
  registrationSchema,
  loginSchema,
} from "../schemas/auth.schema";
import { getJwtSecret } from "../utils/jwt-secret";
import { sendValidationError } from "../utils/validation";

export async function register(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = registrationSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues);
    return;
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
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
    getJwtSecret(),
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
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues);
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.toLowerCase(),
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
      parsed.data.password,
      user.passwordHash,
    ))
  ) {
    res.status(401).json({
      error: "Email or password is incorrect.",
    });
    return;
  }

  const token = jwt.sign(
    { role: user.role },
    getJwtSecret(),
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
    res.status(401).json({
      error: "Authentication is required.",
    });
    return;
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
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.status(200).json(user);
}