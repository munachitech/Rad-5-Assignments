import { Router, Request, Response } from "express";

const router = Router();

interface Product {
  id: number;
  name: string;
  price: number;
}

let products: Product[] = [
  {
    id: 1,
    name: "Laptop",
    price: 999
  },
  {
    id: 2,
    name: "Keyboard",
    price: 50
  }
];

let nextId = 3;

// CREATE
router.post("/", (req: Request, res: Response) => {
  const { name, price } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({
      message: "Name and price are required"
    });
    return;
  }

  const newProduct: Product = {
    id: nextId++,
    name,
    price
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

// READ ALL
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json(products);
});

// READ ONE
router.get("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const product = products.find((product) => product.id === id);

  if (!product) {
    res.status(404).json({
      message: "Product not found"
    });
    return;
  }

  res.status(200).json(product);
});

// UPDATE
router.put("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const product = products.find((product) => product.id === id);

  if (!product) {
    res.status(404).json({
      message: "Product not found"
    });
    return;
  }

  const { name, price } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({
      message: "Name and price are required"
    });
    return;
  }

  product.name = name;
  product.price = price;

  res.status(200).json(product);
});

// DELETE
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const productIndex = products.findIndex(
    (product) => product.id === id
  );

  if (productIndex === -1) {
    res.status(404).json({
      message: "Product not found"
    });
    return;
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct
  });
});

export default router;