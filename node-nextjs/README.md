# node-nextjs

A Next.js App Router app with a page and a route handler, deployed with no Ocel code in it.

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

There is no SDK and no `ocel` dependency. `ocel.json` names a slug and nothing else: Ocel finds `next` in `package.json`, runs the Next build and deploys the result. `app/page.tsx` is the page and `app/health/route.ts` is the route handler.
