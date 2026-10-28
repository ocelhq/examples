# node-env

An Express 5 app that reads a plain variable with a default and a secret, both declared once with `defineEnv`.

## Run it

```bash
pnpm install
echo "API_KEY=dev-key" > .env   # ocel dev reads its values from .env
ocel dev -- pnpm dev
```

```bash
curl localhost:$PORT/greeting
curl localhost:$PORT/whoami -H "x-api-key: dev-key"
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`infra/variables.ts` declares `GREETING` (plain, defaults to `hello` through its schema) and `API_KEY` (a secret) with `defineEnv` from `ocel/env`. `src/server.ts` reads them as typed properties of `env`. Set the secret in your own account before deploying:

```bash
ocel env set API_KEY=your-key
ocel env ls
```

A deploy missing a declared value stops and names the `ocel env set` that fills it. Set `GREETING` the same way to override its default, or leave it. Values live in your account; the secret is never part of the build.
