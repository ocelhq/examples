# node-bucket-nextjs

A bucket with a browser uploader, in the Next.js App Router. A client component uploads straight to the store and route handlers list and download what landed.

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

`infra/index.ts` declares the bucket and its `document` uploader with `ocel/bucket/next`. `app/api/upload/route.ts` exports `createRouteHandler(uploads)`, and `app/api/files` reads the same handle. `app/uploader.tsx` types `createUploadClient` from `typeof uploads`, so an unknown uploader name or a wrong input is a compile error.
