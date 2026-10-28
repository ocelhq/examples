# node-postgres

An Express 5 notes API on a Postgres database that exists because the code says `postgres("main")`.

## Run it

```bash
pnpm install
ocel dev -- pnpm dev
```

```bash
curl -X POST localhost:$PORT/notes -H 'content-type: application/json' -d '{"body":"hello"}'
curl localhost:$PORT/notes
```

`$PORT` is whatever port `ocel dev` prints.

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`infra/index.ts` declares the database with `postgres("main")`, which returns a `pg` pool. `src/server.ts` imports it, creates the `notes` table when it starts, and inserts and selects with `db.query`.
