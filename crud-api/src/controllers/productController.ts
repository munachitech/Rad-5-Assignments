import { Request, Response } from "express";
import {
  products,
  getNextProductId
} from "../data/store.js";

export const createProduct = (
  req: Request,
  res: Response
) => {
  const { name, price } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({
      message: "Name and price are required"
    });
    return;
  }

  const newProduct = {
    id: getNextProductId(),
    name,
    price
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
};

export const getProducts = (
  _req: Request,
  res: Response
) => {
  res.status(200).json(products);
};

export const getProduct = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const product = products.find(
    (product) => product.id === id
  );

  if (!product) {
    res.status(404).json({
      message: "Product not found"
    });
    return;
  }

  res.status(200).json(product);
};

export const updateProduct = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const product = products.find(
    (product) => product.id === id
  );

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
};

export const deleteProduct = (
  req: Request,
  res: Response
) => {
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

  const deletedProduct = products.splice(
    productIndex,
    1
  )[0];

  res.status(200).json({
    message: "Product deleted successfully",
    product: deletedProduct
  });
};