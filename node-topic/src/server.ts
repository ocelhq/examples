import express from "express";
import { orders } from "../infra";

const app = express();
app.use(express.json());

app.post("/orders", async (req, res) => {
  const messageId = await orders.send({
    item: String(req.body?.item ?? "widget"),
    quantity: Number(req.body?.quantity ?? 1),
  });
  res.status(202).json({ messageId });
});

app.listen(Number(process.env.PORT ?? 3000));
