import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { authRateLimit } from "../middleware/rate-limit";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post("/register", authRateLimit, asyncHandler(register));
router.post("/login", authRateLimit, asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getCurrentUser));

export default router;