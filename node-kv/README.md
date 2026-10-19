# node-kv

An Express 5 app on a key-value store (Valkey) with a typed text entry that expires and a counter.

## Run it

```bash
pnpm install
ocel dev
```

```bash
curl -X PUT localhost:$PORT/greetings/ada -H 'content-type: application/json' -d '{"text":"hi ada"}'
curl localhost:$PORT/greetings/ada   # 404 once 30s have passed
curl localhost:$PORT/visits/home     # 1, 2, 3, ...
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

`infra/index.ts` declares the store with `kv("cache", { entries })`. Each entry has a shape and a key pattern: `greeting` is text under `greeting/:name` with a 30 second `ttl`, `visits` is an atomic counter under `visits/:page`. Keys are passed as objects (`{ name }`), so the types follow the pattern. `src/server.ts` writes with `set` and `increment` and reads with `get`.
