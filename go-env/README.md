# go-env

Two variables declared as a struct: one plain with a default, one secret. A `Secret` never prints its value and is read fresh on every `Value()` call, so rotating it reaches a running process.

## Run it

```bash
go mod download
echo 'API_KEY=s3cret' > .env
ocel dev
```

`ocel dev` reads the project's `.env`; `GREETING` falls back to its default.

```bash
curl localhost:3000/greeting
curl localhost:3000/secret -H "x-api-key: s3cret"
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The variables are declared in [`infra/infra.go`](infra/infra.go) with `ocel.Env`; [`main.go`](main.go) reads `infra.Env.Greeting` and compares `infra.Env.APIKey.Value()` to a request header. Set values with [`ocel env`](https://ocel.dev/docs/cli/env), which addresses production unless you pass `--preview`:

```bash
ocel env set GREETING=howdy API_KEY=s3cret
ocel env ls
```

`GREETING` is optional because of its default. `API_KEY` has none, so the app fails to start while it is unset.
