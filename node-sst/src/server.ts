import express from "express";
import { orders } from "../infra";

const app = express();
app.use(express.json());

app.post("/orders", async (req, res) => {
  await orders.query("create table if not exists orders (id serial primary key, item text not null)");
  const { rows } = await orders.query("insert into orders (item) values ($1) returning id, item", [
    req.body.item,
  ]);
  res.status(201).json(rows[0]);
});

app.get("/orders", async (_req, res) => {
  await orders.query("create table if not exists orders (id serial primary key, item text not null)");
  const { rows } = await orders.query("select id, item from orders order by id");
  res.json(rows);
});

app.listen(Number(process.env.PORT ?? 3000));
