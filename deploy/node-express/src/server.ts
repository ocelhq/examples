import express from "express";

const app = express();

app.get("/", (_req, res) => {
  res.send("Hello from Express on Ocel");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(Number(process.env.PORT ?? 3000));
