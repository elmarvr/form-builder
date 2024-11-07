import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const form = sqliteTable("form", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
});

export const formRelations = relations(form, ({ many }) => ({
  fields: many(field),
}));

export const field = sqliteTable("form_field", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  attributes: text("attributes", { mode: "json" })
    .$type<Record<string, any>>()
    .notNull(),
  formId: text("form_id")
    .references(() => form.id)
    .notNull(),
});
