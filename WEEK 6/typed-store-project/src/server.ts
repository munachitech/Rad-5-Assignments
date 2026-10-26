import "dotenv/config";
import bcrypt from "bcrypt";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "./db";
import { Prisma, Role } from "../generated/prisma/client";

const app = express();
const api = express.Router();

const registrationSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const productSchema = z.object({
  name: z.string().trim().min(1),
  category: z.enum(["electronics", "books", "clothing", "home"]),
  price: z.number().finite().positive(),
  stock: z.number().int().nonnegative(),
});

const productUpdateSchema = productSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  { message: "At least one product field must be provided." },
);

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().trim().min(1),
      quantity: z.number().int().positive().safe(),
    }),
  ).min(1),
});

interface AuthContext {
  userId: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function jwtSecret(): string {
  const secret = process.env["JWT_SECRET"];

  if (!secret) {
    throw new Error("JWT_SECRET is missing from the environment.");
  }

  return secret;
}

function isAuthContext(
  payload: string | JwtPayload,
): payload is JwtPayload & AuthContext & { sub: string } {
  return (
    typeof payload !== "string" &&
    typeof payload.sub === "string" &&
    payload.sub.length > 0 &&
    (payload.role === Role.CUSTOMER || payload.role === Role.ADMIN)
  );
}

function authenticate(req: Request, res: Response, next: express.NextFunction): void {
  const authorization = req.header("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    res.status(401).json({ error: "A valid bearer token is required." });
    return;
  }

  const token = match[1];

  if (!token) {
    res.status(401).json({ error: "A valid bearer token is required." });
    return;
  }

  const secret = jwtSecret();
  let payload: string | JwtPayload;

  try {
    payload = jwt.verify(token, secret);
  } catch {
    res.status(401).json({ error: "The authentication token is invalid or expired." });
    return;
  }

  if (!isAuthContext(payload)) {
    res.status(401).json({ error: "The authentication token is invalid." });
    return;
  }

  req.auth = { userId: payload.sub, role: payload.role };
  next();
}

function requireAdmin(req: Request, res: Response, next: express.NextFunction): void {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }

  if (req.auth.role !== Role.ADMIN) {
    res.status(403).json({ error: "Administrator access is required." });
    return;
  }

  next();
}

function sendValidationError(
  res: Response,
  issues: z.ZodIssue[],
): void {
  res.status(400).json({ error: "Invalid request data.", details: issues });
}

api.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

api.post("/auth/register", async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues);
    return;
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: Role.CUSTOMER },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = jwt.sign({ role: user.role }, jwtSecret(), {
    subject: user.id,
    expiresIn: "1h",
  });

  res.status(201).json({ user, token });
});

api.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues);
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, name: true, email: true, role: true, passwordHash: true },
  });

  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  const token = jwt.sign({ role: user.role }, jwtSecret(), {
    subject: user.id,
    expiresIn: "1h",
  });

  res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

api.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  res.status(200).json(products);
});

api.get("/products/:id", async (req, res) => {
  const productId = z.string().min(1).safeParse(req.params.id);

  if (!productId.success) {
    sendValidationError(res, productId.error.issues);
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: productId.data } });

  if (!product) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  res.status(200).json(product);
});

api.post("/products", authenticate, requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues);
    return;
  }

  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json(product);
});

api.patch("/products/:id", authenticate, requireAdmin, async (req, res) => {
  const productId = z.string().min(1).safeParse(req.params.id);
  const parsed = productUpdateSchema.safeParse(req.body);

  if (!productId.success) {
    sendValidationError(res, productId.error.issues);
    return;
  }

  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues);
    return;
  }

  const existing = await prisma.product.findUnique({ where: { id: productId.data } });

  if (!existing) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  const product = await prisma.product.update({
    where: { id: productId.data },
    data: parsed.data,
  });
  res.status(200).json(product);
});

api.delete("/products/:id", authenticate, requireAdmin, async (req, res) => {
  const productId = z.string().min(1).safeParse(req.params.id);

  if (!productId.success) {
    sendValidationError(res, productId.error.issues);
    return;
  }

  const existing = await prisma.product.findUnique({ where: { id: productId.data } });

  if (!existing) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  const product = await prisma.product.delete({ where: { id: productId.data } });
  res.status(200).json(product);
});

api.post("/orders", authenticate, async (req, res) => {
  const auth = req.auth;

  if (!auth) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }

  const parsed = orderSchema.safeParse(req.body);

  if (!parsed.success) {
    sendValidationError(res, parsed.error.issues);
    return;
  }

  const quantities = new Map<string, number>();

  for (const item of parsed.data.items) {
    const quantity = (quantities.get(item.productId) ?? 0) + item.quantity;

    if (!Number.isSafeInteger(quantity)) {
      res.status(400).json({ error: "Combined product quantity is too large." });
      return;
    }

    quantities.set(item.productId, quantity);
  }
  const orderItems = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
  const order = await prisma.$transaction(async (transaction) => {
    const products = await transaction.product.findMany({
      where: { id: { in: orderItems.map((item) => item.productId) } },
      select: { id: true, price: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    if (products.length !== orderItems.length) {
      throw new ApiError(400, "One or more product IDs are invalid.");
    }

    let total = 0;
    const itemsWithPrices = orderItems.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new ApiError(400, "One or more product IDs are invalid.");
      }

      total += product.price * item.quantity;
      return { ...item, unitPrice: product.price };
    });

    for (const item of itemsWithPrices) {
      const deduction = await transaction.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (deduction.count !== 1) {
        throw new ApiError(409, `Insufficient stock for product ${item.productId}.`);
      }
    }

    return transaction.order.create({
      data: {
        userId: auth.userId,
        total,
        items: { create: itemsWithPrices },
      },
      include: { items: true },
    });
  });

  res.status(201).json(order);
});

api.get("/orders", authenticate, async (req, res) => {
  const auth = req.auth;

  if (!auth) {
    res.status(401).json({ error: "Authentication is required." });
    return;
  }

  const orders = await prisma.order.findMany({
    where: auth.role === Role.ADMIN ? undefined : { userId: auth.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(orders);
});

app.use(express.json());
app.use("/api", api);
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "A record with that value already exists." });
      return;
    }

    if (error.code === "P2003") {
      res.status(409).json({ error: "The record cannot be deleted because it is in use." });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({ error: "Record not found." });
      return;
    }
  }

  console.error("API request failed:", error);
  res.status(500).json({ error: "An unexpected server error occurred." });
};

app.use(errorHandler);

const port = Number(process.env["PORT"] ?? 3000);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Store API listening on port ${port}`);
  });
}

export { app };
