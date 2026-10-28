# Typed Store Project

This project includes a TypeScript store manager CLI and a PostgreSQL-backed Express API using Prisma. The CLI continues to demonstrate typed modeling, generic data access, Result-based error handling, and safe validation.

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

## Run the API

Set `DATABASE_URL` and a `JWT_SECRET` of at least 32 bytes in the environment, then run:

```bash
npm start
```

The API listens on port `3000` by default; set `PORT` to override it. All routes are under `/api`.

- `GET /api/health`: health check.
- `POST /api/auth/register` and `POST /api/auth/login`: create an account or receive a JWT. Together, these endpoints allow at most 5 requests per IP every 15 minutes.
- `GET /api/auth/me`: return the authenticated user's profile.
- `GET /api/products` and `GET /api/products/:id`: public product listing and detail.
- `POST /api/products`, `PATCH /api/products/:id`, and `DELETE /api/products/:id`: admin-only product management.
- `POST /api/orders` and `GET /api/orders`: create an order or list orders for the authenticated customer; admins can list all orders.

Send authenticated requests with `Authorization: Bearer <token>`. Public registration always creates a customer account.

## Run the CLI

```bash
npm run cli -- add-product "Laptop" 999 electronics 10
npm run cli -- list
npm run cli -- place-order 1 2
npm run cli -- report
npm run cli -- low-stock 5
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
- `src/index.ts`: CLI application entry point.
- `src/server.ts`: Express API entry point.
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
