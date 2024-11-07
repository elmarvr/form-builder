import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: Resource.TursoUrl.value,
    authToken: Resource.TursoAuthToken.value,
  },
});
