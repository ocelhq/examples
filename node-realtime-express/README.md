# node-realtime-express

A realtime channel on Express. The page subscribes to a room, and a route publishes to it from the server.

## Run it

```bash
pnpm install
ocel dev -- pnpm dev
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`infra/index.ts` declares the `rooms/:roomId` channel with `ocel/realtime/express`. `src/server.ts` mounts `createRealtimeHandler(rt)` at `/api/realtime`, where browsers get authorized, and publishes from `/api/messages` with `rt.publish`. `public/index.html` loads `src/client.ts`, bundled to `public/client.js` by `npm run build`, which subscribes with `createRealtimeClient` from `ocel/realtime/client` typed from the channels.
