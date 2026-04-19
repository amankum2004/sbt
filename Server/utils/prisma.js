const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Define it before initializing Prisma.");
}

const resolveCertPath = (certPath) => {
  if (!certPath) return null;

  const normalizedPath = decodeURIComponent(certPath).trim();
  const candidates = [
    normalizedPath,
    path.resolve(process.cwd(), normalizedPath),
    path.resolve(__dirname, "..", normalizedPath),
    path.resolve(__dirname, "..", "certs", path.basename(normalizedPath)),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
};

const buildPoolConfig = (databaseUrl) => {
  const poolConfig = {
    connectionString: databaseUrl,
    keepAlive: true,
  };

  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch (error) {
    return poolConfig;
  }

  const sslMode = (parsedUrl.searchParams.get("sslmode") || process.env.PGSSLMODE || "")
    .trim()
    .toLowerCase();
  const isAivenHost = parsedUrl.hostname.endsWith(".aivencloud.com");
  const shouldUseSsl = Boolean(sslMode && sslMode !== "disable") || isAivenHost;

  if (!shouldUseSsl) {
    return poolConfig;
  }

  const sslRootCertPath =
    process.env.DATABASE_SSL_CA_PATH ||
    process.env.PGSSLROOTCERT ||
    parsedUrl.searchParams.get("sslrootcert") ||
    (isAivenHost ? "certs/ca.pem" : "");

  const resolvedCertPath = resolveCertPath(sslRootCertPath);

  if (resolvedCertPath) {
    poolConfig.ssl = {
      ca: fs.readFileSync(resolvedCertPath, "utf8"),
      rejectUnauthorized: true,
    };
    return poolConfig;
  }

  poolConfig.ssl = {
    rejectUnauthorized: sslMode === "verify-ca" || sslMode === "verify-full",
  };

  if (sslMode === "require") {
    poolConfig.ssl.rejectUnauthorized = false;
  }

  return poolConfig;
};

const globalForPrisma = global;

const pool =
  globalForPrisma.__prismaPgPool__ ||
  new Pool(buildPoolConfig(connectionString));

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
