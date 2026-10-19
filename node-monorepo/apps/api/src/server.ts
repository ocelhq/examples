import express from "express";

const app = express();

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from the API" });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(Number(process.env.PORT ?? 3001));
