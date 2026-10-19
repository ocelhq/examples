# sdk/bucket/node-express

A bucket with a browser uploader, mounted on Express. The page uploads straight to the store and the server lists and downloads what landed.

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

`infra/index.ts` declares the bucket and its `document` uploader with `ocel/bucket/express`. `src/server.ts` mounts it with `createRouteHandler(uploads)` at `/api/upload` and reads the same handle in `/api/files` (`uploads.list`) and `/api/files/download` (`uploads.get`). `public/index.html` loads `src/client.ts`, bundled to `public/client.js` by `npm run build`, which drives `createUploadClient` from `ocel/bucket/client` typed from the bucket.
