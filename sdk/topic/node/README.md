# sdk/topic/node

An Express 5 app that sends orders to a topic and a consumer that handles each one.

## Run it

```bash
pnpm install
ocel dev
```

```bash
curl -X POST localhost:$PORT/orders -H 'content-type: application/json' -d '{"item":"widget","quantity":3}'
```

The consumer's log line shows up in the `ocel dev` output.

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

`infra/index.ts` declares the topic with `topic("orders")` and a consumer on it with `orders.consumer("fulfil", handler)`. `src/server.ts` calls `orders.send(...)` from a route and answers once the message is accepted. Every consumer of the topic receives each message, outside the request, on Ocel's worker, and a failed attempt is retried. The consumer lives in `infra/` because that is the code the worker runs.
