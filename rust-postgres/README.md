# rust-postgres

A Postgres database declared as a struct field, used from an axum app through its sqlx pool. The declaration is the provisioning step: there is no database to set up by hand.

## Run it

```bash
ocel dev -- cargo run
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`Infra` in `src/main.rs` declares the database with `#[derive(ocel::Resources)]`. `Infra::load()` hands back a handle, and `db.pool()` opens an sqlx pool on the connection Ocel delivers. `POST /notes` (`{"text": "..."}`) inserts a row and `GET /notes` lists them.
