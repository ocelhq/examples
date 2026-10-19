import express from "express";
import { runs } from "ocel/task";
import { buildReport } from "../infra";

const app = express();
app.use(express.json());

app.post("/reports", async (req, res) => {
  const { id } = await buildReport.trigger({ month: String(req.body?.month ?? "2026-01") });
  res.status(202).json({ id });
});

app.get("/reports/:id", async (req, res) => {
  const { status, output } = await runs.retrieve(req.params.id);
  res.json({ status, output });
});

app.listen(Number(process.env.PORT ?? 3000));
