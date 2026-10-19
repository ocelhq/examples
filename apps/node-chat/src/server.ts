import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { createRealtimeHandler } from "ocel/realtime/hono";
import { db, live } from "../infra";

await db.query(`
  create table if not exists messages (
    id         serial primary key,
    room       text not null,
    author     text not null,
    text       text not null,
    created_at timestamptz not null default now()
  )
`);

const app = new Hono();

app.all("/api/realtime", createRealtimeHandler(live));

app.get("/api/rooms/:room/messages", async (c) => {
  const { rows } = await db.query(
    `select id, author, text, created_at::text as "createdAt"
       from (select * from messages where room = $1 order by id desc limit 50) recent
      order by id`,
    [c.req.param("room")],
  );
  return c.json(rows);
});

app.post("/api/rooms/:room/messages", async (c) => {
  const room = c.req.param("room");
  const { author, text } = await c.req.json<{ author: string; text: string }>();
  if (!author?.trim() || !text?.trim()) return c.json({ error: "author and text are required" }, 400);

  const { rows } = await db.query(
    `insert into messages (room, author, text) values ($1, $2, $3)
     returning id, author, text, created_at::text as "createdAt"`,
    [room, author.trim(), text.trim()],
  );
  await live.publish("rooms/:room", { params: { room }, body: rows[0] });
  return c.json(rows[0], 201);
});

app.get("/app.js", serveStatic({ path: "./dist/app.js" }));
app.use("/*", serveStatic({ root: "./public" }));

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) });
