# sdk/postgres/go

A Postgres database declared in one line, used from two `net/http` routes. Nothing configures a connection: `DB.Pool(ctx)` hands back a `pgx` pool on the database Ocel provisioned.

## Run it

```bash
go mod download
ocel dev
```

```bash
curl -X POST localhost:3000/notes -d '{"text":"hello"}'
curl localhost:3000/notes
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The database is declared in [`infra/infra.go`](infra/infra.go) with `ocel.Postgres("main")`; [`main.go`](main.go) imports it and calls `infra.DB.Pool`. `POST /notes` creates the table if needed and inserts a row, `GET /notes` lists them.
