import type { Request, Response } from "express";
import { prisma } from "../db";
import {
    productSchema,
    productUpdateSchema,
} from "../schemas/product.schema";
import { sendValidationError } from "../utils/validation";

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
        res.status(400).json({ error: "Invalid product ID." });
        return;
    }
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        res.status(404).json({
            error: "Product not found.",
        });
        return;
    }

    res.status(200).json(product);
}

export async function createProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.issues);
        return;
    }

    const product = await prisma.product.create({
        data: parsed.data,
    });

    res.status(201).json(product);
}

export async function updateProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const productId = req.params.id;
    if(!productId) {
        res.status(400).json({ error: "Product ID is required." });
        return;
    }

    if (typeof productId !== "string") {
        res.status(400).json({ error: "Invalid product ID." });
        return;
    }
    const parsed = productUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
        sendValidationError(res, parsed.error.issues);
        return;
    }

    const existing = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!existing) {
        res.status(404).json({
            error: "Product not found.",
        });
        return;
    }

    const product = await prisma.product.update({
        where: { id: productId },
        data: parsed.data,
    });

    res.status(200).json(product);
}

export async function deleteProduct(
    req: Request,
    res: Response,
): Promise<void> {
    const productId = req.params.id;

    if (!productId) {
        res.status(400).json({ error: "Product ID is required." });
        return;
    }
    if (typeof productId !== "string") {
        res.status(400).json({ error: "Invalid product ID." });
        return;
    }
    const existing = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!existing) {
        res.status(404).json({
            error: "Product not found.",
        });
        return;
    }

    const product = await prisma.product.delete({
        where: { id: productId },
    });

    res.status(200).json(product);
}