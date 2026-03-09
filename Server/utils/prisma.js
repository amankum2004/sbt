const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Define it before initializing Prisma.");
}

const globalForPrisma = global;

const pool =
  globalForPrisma.__prismaPgPool__ ||
  new Pool({
    connectionString,
  });

const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.__prismaClient__ ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prismaPgPool__ = pool;
  globalForPrisma.__prismaClient__ = prisma;
}

module.exports = prisma;
