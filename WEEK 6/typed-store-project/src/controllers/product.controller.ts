import type { Request, Response } from "express";
import { apiProductService } from "../services/api-product.service";
import {
    productSchema,
    productUpdateSchema,
} from "../schemas/product.schema";
import { ApiError } from "../utils/api-error";
import { objectIdSchema } from "../utils/validation";

export async function listProducts(
    _req: Request,
    res: Response,
): Promise<void> {
    const products = await apiProductService.listProducts();
    res.status(200).json(products);
}

export async function getProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const productId = objectIdSchema.parse(req.params.id);
    const product = await apiProductService.getProductById(productId);
    res.status(200).json(product);
}

export async function createProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const parsed = productSchema.parse(req.body);

    const product = await apiProductService.createProduct(parsed);
    res.status(201).json(product);
}

export async function updateProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const rawProductId = req.params.id;
    if (!rawProductId) {
        throw new ApiError(400, "Product ID is required.");
    }

    const productId = objectIdSchema.parse(rawProductId);
    const parsed = productUpdateSchema.parse(req.body);

    const product = await apiProductService.updateProduct(
        productId,
        parsed,
    );
    res.status(200).json(product);
}

export async function deleteProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const rawProductId = req.params.id;

    if (!rawProductId) {
        throw new ApiError(400, "Product ID is required.");
    }
    const productId = objectIdSchema.parse(rawProductId);
    const product = await apiProductService.deleteProduct(productId);
    res.status(200).json(product);
}