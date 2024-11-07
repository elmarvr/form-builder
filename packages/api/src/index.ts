import { Hono } from "hono";
import { db, eq, table } from "@form-builder/db";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { handle } from "hono/aws-lambda";

const app = new Hono().basePath("/api");

const routes = app
  .get(
    "/form/:formId",

    async (c) => {
      const formId = c.req.param("formId");
      const data = await db.query.form.findFirst({
        where: eq(table.form.id, formId),
        with: {
          fields: true,
        },
      });

      if (!data) {
        throw new Error("Not found");
      }

      return c.json(data);
    }
  )
  .post(
    "/form",
    zValidator(
      "json",
      z.object({
        fields: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            attributes: z.record(z.unknown()),
          })
        ),
      })
    ),
    async (c) => {
      const json = c.req.valid("json");

      const formId = await db
        .insert(table.form)
        .values({})
        .returning({
          id: table.form.id,
        })
        .then((value) => value[0]?.id ?? null);

      if (!formId) {
        throw new Error("Failed to create form");
      }

      await db.insert(table.field).values(
        json.fields.map((field) => ({
          ...field,
          formId,
        }))
      );

      return c.json({ id: formId });
    }
  );

export type AppType = typeof routes;

export const handler = handle(routes);
