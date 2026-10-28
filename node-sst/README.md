# node-sst

`@ocel/sst` lets an SST app publish a resource it provisions as an Ocel binding, for when you want to own that infrastructure yourself instead of having Ocel create it. Here SST runs the VPC and Postgres database, and Ocel deploys the app that reads it.

## Run it

```bash
pnpm install
ocel dev -- pnpm start
```

`ocel dev` runs its own Postgres, so it needs nothing from SST.

## Deploy it

```bash
sst deploy
ocel deploy
```

Run `sst deploy` first. The binding it publishes is what the deployed app reads.

`ocel projects destroy` takes the app down again, and `sst remove` takes the database down.

## How it works

`sst.config.ts` creates the `sst.aws.Postgres` component and passes it straight to `bind.postgres("orders", orders)`, which publishes the connection details by running the `ocel` CLI in this directory. `ocel.json` maps the app's `orders` postgres to that record with `"@orders"`. `infra/index.ts` declares `postgres("orders")` as usual and `src/server.ts` queries it, so the app code is the same whether Ocel or SST provisions the database.
