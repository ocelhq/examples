# node-nextjs

A Next.js App Router app with a page and a route handler, deployed with no Ocel code in it.

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

There is no SDK, no `ocel` dependency and no config. Ocel finds `next` in `package.json`, runs the Next build and deploys the result. `app/page.tsx` is the page and `app/health/route.ts` is the route handler.
