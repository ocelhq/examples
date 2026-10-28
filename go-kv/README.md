# go-kv

A key-value store with a typed counter entry. Declaring the entry is what gives `Increment` and `Get` their key shape: `hits/:page` takes a `string`.

## Run it

```bash
go mod download
ocel dev -- go run .
```

```bash
curl -X POST localhost:3000/hits/home
curl localhost:3000/hits/home
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

The store and its entry are declared in [`infra/infra.go`](infra/infra.go) with `kv.New` and `kv.NewCounter`; [`main.go`](main.go) increments in `POST /hits/{page}` and reads in `GET /hits/{page}`, treating `kv.ErrMiss` as zero.
