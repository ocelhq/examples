import express from "express";
import { createRealtimeHandler } from "ocel/realtime/express";
import { rt } from "../infra/index";

const app = express();

// Browsers authorize their subscriptions through this route; the transport only checks its tokens.
app.all("/api/realtime", createRealtimeHandler(rt));

app.post("/api/messages", express.json(), async (req, res) => {
  await rt.publish("rooms/:roomId", {
    params: { roomId: "lobby" },
    body: { text: String(req.body?.text ?? "") },
  });
  res.status(204).end();
});

app.use(express.static("public"));

app.listen(Number(process.env.PORT ?? 3000));
