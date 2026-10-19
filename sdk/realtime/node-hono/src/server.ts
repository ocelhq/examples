import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { createRealtimeHandler } from "ocel/realtime/hono";
import { rt } from "../infra/index";

const app = new Hono();

// Browsers authorize their subscriptions through this route; the transport only checks its tokens.
app.all("/api/realtime", createRealtimeHandler(rt));

app.post("/api/messages", async (c) => {
  const { text } = await c.req.json<{ text: string }>();
  await rt.publish("rooms/:roomId", { params: { roomId: "lobby" }, body: { text } });
  return c.body(null, 204);
});

app.use("/*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) });
