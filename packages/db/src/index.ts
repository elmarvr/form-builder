import { drizzle } from "drizzle-orm/d1";
import { Resource } from "sst";
import { form, field } from "./schema";

export const table = {
  form,
  field,
};

export const db = drizzle(Resource.D1, {
  schema: {
    form,
    field,
  },
});

export * from "drizzle-orm/expressions";
