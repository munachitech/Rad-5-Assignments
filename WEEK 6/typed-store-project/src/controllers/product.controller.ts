import type { Request, Response } from "express";
import { prisma } from "../db";
import {
    productSchema,
    productUpdateSchema,
} from "../schemas/product.schema";
import { ApiError } from "../utils/api-error";

export async function listProducts(
    _req: Request,
    res: Response,
): Promise<void> {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
    });

    res.status(200).json(products);
}

export async function getProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const productId = req.params.id;

    if (typeof productId !== "string") {
        throw new ApiError(400, "Invalid product ID.");
    }
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new ApiError(404, "Product not found.");
    }

    res.status(200).json(product);
}

export async function createProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const parsed = productSchema.parse(req.body);

    const product = await prisma.product.create({
        data: parsed,
    });

    res.status(201).json(product);
}

export async function updateProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const productId = req.params.id;
    if (!productId) {
        throw new ApiError(400, "Product ID is required.");
    }

    if (typeof productId !== "string") {
        throw new ApiError(400, "Invalid product ID.");
    }
    const parsed = productUpdateSchema.parse(req.body);

    const existing = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!existing) {
        throw new ApiError(404, "Product not found.");
    }

    const product = await prisma.product.update({
        where: { id: productId },
        data: parsed,
    });

    res.status(200).json(product);
}

export async function deleteProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const productId = req.params.id;

    if (!productId) {
        throw new ApiError(400, "Product ID is required.");
    }
    if (typeof productId !== "string") {
        throw new ApiError(400, "Invalid product ID.");
    }
    const existing = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!existing) {
        throw new ApiError(404, "Product not found.");
    }

    const product = await prisma.product.delete({
        where: { id: productId },
    });

    res.status(200).json(product);
}