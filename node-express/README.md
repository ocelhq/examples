# node-express

An Express 5 app in TypeScript, deployed as-is.

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

No SDK and no `ocel` dependency. Ocel finds `src/server.ts` and serves it. The app listens on `$PORT`, which is the one thing a deployed app needs to do. Node runs the TypeScript directly (Node 22.18 or later).
