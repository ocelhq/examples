import express from "express";
import { createRouteHandler } from "ocel/bucket/express";
import { uploads } from "../infra/index";

const app = express();

// The browser client talks to this one route: presign, then poll until the upload is recorded.
app.all("/api/upload", createRouteHandler(uploads));

app.get("/api/files", async (_req, res) => {
  const files = [];
  for await (const object of uploads.list({ prefix: "documents/" })) {
    files.push({ key: object.key });
  }
  res.json(files);
});

app.get("/api/files/download", async (req, res) => {
  const key = String(req.query.key ?? "");
  if (!key.startsWith("documents/")) {
    res.status(400).end();
    return;
  }
  const object = await uploads.get(key);
  if (!object) {
    res.status(404).end();
    return;
  }
  res.type(object.info.contentType || "application/octet-stream");
  res.send(Buffer.from(await object.bytes()));
});

app.use(express.static("public"));

app.listen(Number(process.env.PORT ?? 3000));
