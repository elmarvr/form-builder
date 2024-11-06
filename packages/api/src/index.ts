import { Hono } from "hono";

const app = new Hono().basePath("/api");

const routes = app.get("", (c) => {
  return c.json({ message: "Hello, World!" });
});

export default app;
