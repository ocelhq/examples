import express from "express";
import { runs } from "ocel/task";
import { resize } from "../infra";

const app = express();
app.use(express.json());

app.post("/resize", async (req, res) => {
  const { id } = await resize.trigger({
    image: String(req.body?.image ?? "photo.jpg"),
    width: Number(req.body?.width ?? 640),
  });
  res.status(202).json({ id });
});

app.get("/runs/:id", async (req, res) => {
  const { id, status, output, error, attempts } = await runs.retrieve(req.params.id);
  res.json({ id, status, output, error, attempts });
});

app.listen(Number(process.env.PORT ?? 3000));
