import { createId } from "@paralleldrive/cuid2";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const form = sqliteTable("form", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
});

export const field = sqliteTable("form_field", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  attributes: text("attributes", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull(),
  formId: text("form_id")
    .references(() => form.id)
    .notNull(),
});
