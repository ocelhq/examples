import express from "express";
import { env } from "../infra/variables";

const app = express();

app.get("/greeting", (_req, res) => {
  res.json({ greeting: env.GREETING });
});

app.get("/whoami", (req, res) => {
  const ok = req.header("x-api-key") === env.API_KEY;
  res.status(ok ? 200 : 401).json({ ok });
});

app.listen(Number(process.env.PORT ?? 3000));
