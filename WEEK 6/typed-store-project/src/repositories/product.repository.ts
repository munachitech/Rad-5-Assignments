import type { Product, Prisma } from "@prisma/client";
import { prisma } from "../db";

export type ProductCreateData = Pick<
  Prisma.ProductCreateInput,
  "name" | "category" | "price" | "stock"
>;

export type ProductUpdateData = Partial<ProductCreateData>;

export interface ProductRepository {
  listProducts(): Promise<Product[]>;
  findProductById(productId: string): Promise<Product | null>;
  createProduct(data: ProductCreateData): Promise<Product>;
  updateProduct(
    productId: string,
    data: ProductUpdateData,
  ): Promise<Product>;
  deleteProduct(productId: string): Promise<Product>;
}

export class PrismaProductRepository implements ProductRepository {
  async listProducts(): Promise<Product[]> {
    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findProductById(productId: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async createProduct(data: ProductCreateData): Promise<Product> {
    return prisma.product.create({ data });
  }

  async updateProduct(
    productId: string,
    data: ProductUpdateData,
  ): Promise<Product> {
    return prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  async deleteProduct(productId: string): Promise<Product> {
    return prisma.product.delete({
      where: { id: productId },
    });
  }
}
