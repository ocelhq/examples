# node-transforms

`@ocel/transforms` patches the cloud resources Ocel provisions, from a module Ocel runs before it provisions anything, for when the defaults almost fit. Here a bucket and the Lambda behind each route get adjusted.

## Run it

```bash
pnpm install
ocel dev -- pnpm start
```

Transforms shape the resources Ocel deploys to your cloud.

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`ocel.json` lists `transforms/defaults.transform.ts`. Each rule in it patches one resource: `aws.function.lambda` takes the arguments of `aws.lambda.Function`, so every route gets 1024 MB and a 30 second timeout, and a rule with an `if` gate applies `forceDestroy` to the bucket outside production. A `tags` rule is added to everything Ocel creates. The bucket is declared in `infra/index.ts` and used in `src/server.ts`; the transform changes how it is provisioned and the app does not know.

The `aws` branch only applies when you deploy to AWS. A module with no branch for the provider you deploy to refuses the deploy.
