import "dotenv/config";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

const databaseUrl = process.env["DATABASE_URL"];

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    ...(databaseUrl ? { db: { connection: databaseUrl } } : {}),
  }),
});
