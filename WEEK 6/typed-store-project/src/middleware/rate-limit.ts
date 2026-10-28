import { rateLimit } from "express-rate-limit";
import { ApiError } from "../utils/api-error";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        "Too many authentication attempts. Please try again later.",
      ),
    );
  },
});
