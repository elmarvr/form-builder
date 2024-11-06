import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: Resource.Drizzle.accountId,
    databaseId: Resource.Drizzle.databaseId,
    token: Resource.Drizzle.token,
  },
});
