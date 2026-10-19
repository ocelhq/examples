# sdk/realtime/python

A FastAPI app that publishes events to a realtime channel that browsers subscribe to. The server publishes; the transport (an Ocel gateway in dev, your cloud's own service when deployed) holds the sockets.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev
```

```bash
curl -X POST localhost:3000/rooms/lobby/messages -H "content-type: application/json" -d '{"text":"hello"}'
```


## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The resource and the `rooms/:roomId` channel (typed by a pydantic model, public to subscribe) are declared in `infra/__init__.py`. `main.py` publishes with `room.publish_async(message, roomId=...)` and mounts `live.asgi()` at `/api/realtime`: that is the handler a browser asks for a short-lived token before opening a socket.

There is no HTML page here. The subscribing half is the JavaScript client, `createRealtimeClient({ url: "/api/realtime" })` from `ocel/realtime/client`, which needs an npm project to install. Point it at this server and call `subscribe("rooms/:roomId", { params: { roomId: "lobby" } }, handler)`; `ocel generate` writes the TypeScript types for a channel declared in Python.
