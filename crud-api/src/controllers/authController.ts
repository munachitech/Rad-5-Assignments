import dotenv from "dotenv";

dotenv.config();
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  users,
  getNextUserId
} from "../data/store.js";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const register = async (
  req: Request,
  res: Response
) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      message: "Username and password are required"
    });
    return;
  }

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
    password: hashedPassword
  };

  users.push(newUser);
  console.log("Registered users:", users);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser.id,
      username: newUser.username
    }
  });
};

export const login = async (
  req: Request,
  res: Response
) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({
      message: "Username and password are required"
    });
    return;
  }

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
    user.password
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

  res.status(200).json({
    message: "Login successful",
    token
  });
};