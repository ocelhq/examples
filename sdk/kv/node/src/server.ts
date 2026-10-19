import express from "express";
import { cache } from "../infra";

const app = express();
app.use(express.json());

app.put("/greetings/:name", async (req, res) => {
  const { name } = req.params;
  await cache.greeting.set({ name }, String(req.body?.text ?? `hello ${name}`));
  res.status(204).end();
});

app.get("/greetings/:name", async (req, res) => {
  const text = await cache.greeting.get({ name: req.params.name });
  if (text === undefined) {
    res.status(404).json({ error: "not found, or expired after 30s" });
    return;
  }
  res.json({ text });
});

app.get("/visits/:page", async (req, res) => {
  const visits = await cache.visits.increment({ page: req.params.page });
  res.json({ page: req.params.page, visits });
});

app.listen(Number(process.env.PORT ?? 3000));
