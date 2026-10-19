import express from "express";
import { db } from "../infra";

await db.query(`
  create table if not exists notes (
    id serial primary key,
    body text not null,
    created_at timestamptz not null default now()
  )
`);

const app = express();
app.use(express.json());

app.post("/notes", async (req, res) => {
  const { rows } = await db.query(
    "insert into notes (body) values ($1) returning id, body, created_at",
    [String(req.body?.body ?? "")],
  );
  res.status(201).json(rows[0]);
});

app.get("/notes", async (_req, res) => {
  const { rows } = await db.query("select id, body, created_at from notes order by id desc");
  res.json(rows);
});

app.listen(Number(process.env.PORT ?? 3000));
