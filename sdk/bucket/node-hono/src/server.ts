import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { createRouteHandler } from "ocel/bucket/hono";
import { uploads } from "../infra/index";

const app = new Hono();

// The browser client talks to this one route: presign, then poll until the upload is recorded.
app.all("/api/upload", createRouteHandler(uploads));

app.get("/api/files", async (c) => {
  const files = [];
  for await (const object of uploads.list({ prefix: "documents/" })) {
    files.push({ key: object.key });
  }
  return c.json(files);
});

app.get("/api/files/download", async (c) => {
  const key = c.req.query("key") ?? "";
  if (!key.startsWith("documents/")) {
    return c.body(null, 400);
  }
  const object = await uploads.get(key);
  if (!object) {
    return c.body(null, 404);
  }
  return new Response(object.body, {
    headers: { "content-type": object.info.contentType || "application/octet-stream" },
  });
});

app.use("/*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) });
