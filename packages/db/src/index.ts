import { drizzle } from "drizzle-orm/libsql";
import { Resource } from "sst";
import { createClient } from "@libsql/client";
import { form, field, formRelations } from "./schema";

export const table = {
  form,
  field,
};

const client = createClient({
  url: Resource.TursoUrl.value,
  authToken: Resource.TursoAuthToken.value,
});

export const db = drizzle(client, {
  schema: {
    form,
    field,
    formRelations,
  },
});

export * from "drizzle-orm/expressions";
