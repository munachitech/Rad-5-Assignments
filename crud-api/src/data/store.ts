import { Product, User } from "../types/index.js";

export const products: Product[] = [
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

export const users: User[] = [];

let nextProductId = 3;
let nextUserId = 1;

export const getNextProductId = (): number => {
  return nextProductId++;
};

export const getNextUserId = (): number => {
  return nextUserId++;
};