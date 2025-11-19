import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"), // Pooled connection (port 6543)
    directUrl: env("DIRECT_URL"), // Direct connection (port 5432) for migrations
  },
});
