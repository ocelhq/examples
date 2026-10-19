import express from "express";
import { uploads } from "../infra";

const app = express();

app.put("/files/:name", express.raw({ type: "*/*", limit: "5mb" }), async (req, res) => {
  await uploads.put(req.params.name, req.body, { contentType: req.get("content-type") });
  res.status(201).json({ key: req.params.name });
});

app.get("/files/:name", async (req, res) => {
  const file = await uploads.get(req.params.name);
  if (!file) return void res.status(404).end();
  res.type(file.info.contentType ?? "application/octet-stream").send(Buffer.from(await file.bytes()));
});

app.listen(Number(process.env.PORT ?? 3000));
