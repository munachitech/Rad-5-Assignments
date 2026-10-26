import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}