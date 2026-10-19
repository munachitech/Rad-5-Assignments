import dotenv from "dotenv";
import { z } from "zod";
import { Request, Response } from "express";
import { AuthRequest, LoginResponse, PublicUser } from "../types/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { users, getNextUserId } from "../data/store.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const register = async (
  req: Request,
  res: Response
) => {
  const result = authSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid username or password"
    });
    return;
  }

  const { username, password } = result.data;
  const existingUser = users.find(
    (user) => user.username === username
  );

  if (existingUser) {
    res.status(400).json({
      message: "Username already exists"
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: getNextUserId(),
    username,
    passwordHash: hashedPassword
  };

  users.push(newUser);

  const publicUser: PublicUser = {
    id: newUser.id,
    username: newUser.username
  };

  res.status(201).json({
    message: "User registered successfully",
    user: publicUser
  });
};

export const login = async (
  req: Request,
  res: Response
) => {
  const result = authSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid username or password"
    });
    return;
  }

  const { username, password } = result.data;
  const user = users.find(
    (user) => user.username === username
  );

  if (!user) {
    res.status(401).json({
      message: "Invalid username or password"
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatch) {
    res.status(401).json({
      message: "Invalid username or password"
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: user.id
    },
    JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  const publicUser: PublicUser = {
    id: user.id,
    username: user.username
  };
  const response: LoginResponse = {
    token,
    user: publicUser
  };

  res.status(200).json(response);
};

export const me = (req: AuthRequest, res: Response) => {
  const user = users.find(
    (user) => user.id === req.userId
  );

  if (!user) {
    res.status(404).json({
      message: "User not found"
    });
    return;
  }

  const publicUser: PublicUser = {
    id: user.id,
    username: user.username
  };

  res.status(200).json(publicUser);
};
