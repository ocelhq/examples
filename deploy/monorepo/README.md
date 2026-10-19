# deploy/monorepo

A pnpm workspace with two apps, a Next.js `web` and an Express `api`, deployed from one `ocel.json`.

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

`apps` in `ocel.json` lists each app by name and path. Without it Ocel would look for a single app at the root and find none. `apps/web` is the Next.js app and `apps/api` is the Express one; both are plain apps with no Ocel code.
