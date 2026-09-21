# Typed Store Project

This project is a beginner-friendly TypeScript store manager that keeps products and orders in an in-memory data store. It demonstrates typed modeling, generic data access, Result-based error handling, and safe CLI validation.

## Install dependencies

```bash
npm install
```

## Type-check the project

```bash
npm run typecheck
```

This command runs TypeScript in no-emit mode so you can catch issues without generating JavaScript output.

## Build the project

```bash
npm run build
```

This compiles the project into the `dist` folder.

## Run the CLI

```bash
npm start -- add-product "Laptop" 999 electronics 10
npm start -- list
npm start -- place-order 1 2
npm start -- report
npm start -- low-stock 5
```

## CLI commands

- `add-product <name> <price> <category> <stock>`: creates a new product after validating the input.
- `list`: displays all products currently in the store.
- `place-order <productId> <quantity> ...`: creates an order when each product exists and has enough stock.
- `report`: shows top-selling products while ignoring cancelled orders.
- `low-stock <threshold>`: prints products with stock at or below the given threshold.

## Project structure

- `src/models.ts`: shared TypeScript models and derived types.
- `src/errors.ts`: discriminated union error definitions.
- `src/result.ts`: typed `Result<T, E>` helper.
- `src/state.ts`: in-memory state and generic `DataStore` class.
- `src/services/productService.ts`: product validation and CRUD logic.
- `src/services/orderService.ts`: order creation and stock deduction logic.
- `src/services/reportService.ts`: reporting logic for low stock and top sellers.
- `src/cli.ts`: CLI parsing, validation, and command routing.
- `src/index.ts`: application entry point.
- `docs/types.md`: examples of TypeScript problems and fixes.

## Major TypeScript concepts demonstrated

- interfaces
- union types
- discriminated unions
- `Omit`
- `Partial`
- `Pick`
- `Record`
- generics
- generic classes
- strict null checking
- type narrowing
- typed `Result<T, E>` pattern
