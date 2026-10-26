import { Router } from "express";
import {
  createOrder,
  listOrders,
} from "../controllers/order.controller";
import { authenticate } from "../middleware/authenticate";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post("/", authenticate, asyncHandler(createOrder));
router.get("/", authenticate, asyncHandler(listOrders));

export default router;