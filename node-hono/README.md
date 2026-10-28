# node-hono

A Hono app on Node in TypeScript, deployed as-is.

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

No SDK and no `ocel` dependency. Ocel finds `src/server.ts` and serves it; `@hono/node-server` listens on `$PORT`. Node runs the TypeScript directly (Node 22.18 or later).
