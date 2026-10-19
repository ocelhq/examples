# node-file-share

Upload files and hand out short links that expire. The one thing worth noticing: the browser uploads straight to the bucket, and the link's expiry is nothing more than a TTL on a kv key.

## Run it

```bash
pnpm install
ocel dev
```

Upload a file, pick an expiry and press Share, then open the `/s/<code>` link.

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## Architecture

| Resource | Declared in | Why it is here |
| --- | --- | --- |
| Bucket `uploads`, uploader `file` | `infra/index.ts` | Holds the files. The uploader limits size and count, and `onUploadComplete` records each file once its bytes have landed. |
| Postgres `files` | `infra/index.ts` | The file list: name, type, size and bucket key. The table is created in `instrumentation.ts` when the server starts. |
| Kv `links`, entry `link/:code` | `infra/index.ts` | Maps a short code to a file id. Each write sets its own TTL, so an expired link is simply a missing key. |

## How it works

`infra/index.ts` declares all three. `app/api/upload/route.ts` mounts the uploader with `createRouteHandler`, and `app/upload-button.tsx` drives it with `createUploadClient`, typed from the bucket. `lib/files.ts` creates and resolves links, and `app/s/[code]/route.ts` looks a code up in kv, finds the file in Postgres and streams it from the bucket.
