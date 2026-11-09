// One shared database connection for the whole app
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
