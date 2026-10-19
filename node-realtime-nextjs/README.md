# node-realtime-nextjs

A realtime channel in the Next.js App Router. A client component subscribes to a room, and a route handler publishes to it from the server.

## Run it

```bash
pnpm install
ocel dev
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

`infra/index.ts` declares the `rooms/:roomId` channel with `ocel/realtime/next`. `app/api/realtime/route.ts` exports `createRealtimeHandler(rt)`, where browsers get authorized, and `app/api/messages/route.ts` publishes with `rt.publish`. `app/room.tsx` types `createRealtimeClient` from `typeof rt`, so the event handed to `subscribe` is the channel schema's type.
