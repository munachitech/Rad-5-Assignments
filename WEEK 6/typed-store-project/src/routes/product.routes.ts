import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/require-admin";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/", asyncHandler(listProducts));
router.get("/:id", asyncHandler(getProduct));
router.post("/", authenticate, requireAdmin, asyncHandler(createProduct));
router.patch("/:id", authenticate, requireAdmin, asyncHandler(updateProduct));
router.delete("/:id", authenticate, requireAdmin, asyncHandler(deleteProduct));

export default router;