# rust-kv

A key-value store (Valkey) declared as a struct field, with a typed counter entry. The declaration is the provisioning step.

## Run it

```bash
ocel dev
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

A key is declared once as a struct with `#[derive(ocel::KvKey)]`: a pattern (`hits/:page`) and a shape (`counter`). `Infra` in `src/main.rs` lists it under `entries`, so the store only accepts keys it declared. `POST /hits/<page>` increments the counter and `GET /hits/<page>` reads it.
