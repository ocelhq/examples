import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send(`Hello from ${req.hostname}`);
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(Number(process.env.PORT ?? 3000));
