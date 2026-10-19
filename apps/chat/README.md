# apps/chat

A small chat app on Hono: rooms, messages saved in Postgres, and new messages pushed to every open browser through Ocel realtime. The one thing worth noticing: the browser never polls and the server never holds a socket; `live.publish` after the insert is the whole delivery path.

## Run it

```bash
pnpm install
ocel dev
```

Open the printed URL in two tabs, join the same room, and send a message.

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## Architecture

| Resource | Declared in | Why it is here |
| --- | --- | --- |
| Postgres `chat` | `infra/index.ts` | Stores every message so a room has history when someone joins. The table is created when the server starts. |
| Realtime `chat`, channel `rooms/:room` | `infra/index.ts` | Delivers each new message to the browsers subscribed to that room. The channel is public and typed by the `Message` schema. |

## How it works

`infra/index.ts` declares both resources. `src/server.ts` mounts `createRealtimeHandler(live)` from `ocel/realtime/hono` at `/api/realtime`, and its `POST /api/rooms/:room/messages` route inserts the row and calls `live.publish`. `src/client.ts` is bundled by esbuild into `dist/app.js`; it imports `createRealtimeClient` from `ocel/realtime/client` and the type of `live` from `infra/`, so channel names and event shapes are checked at compile time. `public/index.html` is the page.
