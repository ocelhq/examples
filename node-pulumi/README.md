# node-pulumi

`@ocel/pulumi` lets a Pulumi program publish a resource it provisions as an Ocel binding, for when you want to own that infrastructure yourself instead of having Ocel create it. Here Pulumi runs the RDS Postgres instance, and Ocel deploys the app that reads it.

## Run it

```bash
pnpm install
ocel dev -- pnpm start
```

`ocel dev` runs its own Postgres, so it needs nothing from Pulumi.

## Deploy it

```bash
pulumi config set aws:region us-east-1
pulumi config set --secret dbPassword "<a password>"
pulumi up
ocel deploy
```

Run `pulumi up` first. The binding it publishes is what the deployed app reads.

`ocel projects destroy` takes the app down again, and `pulumi destroy` takes the database down.

## How it works

`index.ts` is the Pulumi program: it creates the instance and calls `bind.postgres("orders", ...)` with its address, port, database, username and password. `ocel.json` maps the app's `orders` postgres to that record with `"@orders"`, and `pulumi up` publishes the record by running the `ocel` CLI in this directory. `infra/index.ts` declares `postgres("orders")` as usual and `src/server.ts` queries it, so the app code is the same whether Ocel or Pulumi provisions the database.

The instance is publicly reachable so the app needs no VPC. Put it in a private network for anything real.
