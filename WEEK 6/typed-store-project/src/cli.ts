import type { Category, OrderItem } from "./models";
import { orderService } from "./services/orderService";
import { productService } from "./services/productService";
import { reportService } from "./services/reportService";

function isCategory(value: string): value is Category {
  return (
    value === "electronics" ||
    value === "books" ||
    value === "clothing" ||
    value === "home"
  );
}

function parsePositiveNumber(value: string): number | undefined {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function parseNonNegativeNumber(value: string): number | undefined {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function printError(message: string): void {
  console.error(`Error: ${message}`);
}

export function runCli(argv: string[]): void {
  const [command, ...rest] = argv;

  if (!command) {
    console.log("Available commands:");
    console.log("- add-product <name> <price> <category> <stock>");
    console.log("- list");
    console.log("- place-order <productId> <quantity> [<productId> <quantity> ...]");
    console.log("- report");
    console.log("- low-stock <threshold>");
    return;
  }

  switch (command) {
    case "add-product": {
      if (rest.length < 4) {
        printError("Usage: add-product <name> <price> <category> <stock>");
        return;
      }

      const [name, priceText, categoryText, stockText] = rest;
      const price = parsePositiveNumber(priceText);
      const stock = parseNonNegativeNumber(stockText);

      if (!isCategory(categoryText)) {
        printError("Category must be one of: electronics, books, clothing, home.");
        return;
      }

      if (!price) {
        printError("Price must be a number greater than zero.");
        return;
      }

      if (stock === undefined) {
        printError("Stock must be zero or greater.");
        return;
      }

      const result = productService.createProduct({
        name,
        price,
        category: categoryText,
        stock,
      });

      if (result.ok) {
        console.log(`Added product ${result.value.name} with id ${result.value.id}.`);
      } else {
        printError(result.error.message);
      }
      return;
    }

    case "list": {
      const products = productService.listProducts();

      if (products.length === 0) {
        console.log("No products available.");
        return;
      }

      for (const product of products) {
        console.log(
          `${product.id}: ${product.name} | ${product.category} | $${product.price.toFixed(2)} | stock: ${product.stock}`,
        );
      }
      return;
    }

    case "place-order": {
      if (rest.length === 0 || rest.length % 2 !== 0) {
        printError("Usage: place-order <productId> <quantity> [<productId> <quantity> ...]");
        return;
      }

      const items: OrderItem[] = [];

      for (let index = 0; index < rest.length; index += 2) {
        const productId = rest[index].trim();
        const quantityText = rest[index + 1];
        const quantity = parsePositiveNumber(quantityText);

        if (!productId) {
          printError("Each product id must be a non-empty string.");
          return;
        }

        if (quantity === undefined) {
          printError(`Quantity for product ${productId} must be a positive number.`);
          return;
        }

        items.push({ productId, quantity: Math.floor(quantity) });
      }

      const result = orderService.placeOrder(items);

      if (result.ok) {
        console.log(`Order created: ${result.value.id} | total: $${result.value.total.toFixed(2)}`);
      } else {
        printError(result.error.message);
      }
      return;
    }

    case "report": {
      const sellers = reportService.getTopSellers();

      if (sellers.length === 0) {
        console.log("No sales yet.");
        return;
      }

      console.log("Top sellers:");

      for (const seller of sellers) {
        console.log(`${seller.productName} (${seller.productId}) - ${seller.totalSold} sold`);
      }
      return;
    }

    case "low-stock": {
      if (rest.length !== 1) {
        printError("Usage: low-stock <threshold>");
        return;
      }

      const threshold = parseNonNegativeNumber(rest[0]);

      if (threshold === undefined) {
        printError("Threshold must be a number greater than or equal to zero.");
        return;
      }

      const lowStockItems = reportService.getLowStockReport(threshold);

      if (lowStockItems.length === 0) {
        console.log(`No products are at or below stock threshold ${threshold}.`);
        return;
      }

      console.log(`Low-stock items at threshold ${threshold}:`);

      for (const item of lowStockItems) {
        console.log(`${item.name} (${item.id}) - stock: ${item.stock}`);
      }
      return;
    }

    default: {
      printError(`Unknown command: ${command}`);
      console.log("Use: add-product, list, place-order, report, low-stock");
    }
  }
}
