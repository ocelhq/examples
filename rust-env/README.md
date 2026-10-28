# rust-env

Environment variables declared as a struct: one plain variable with a default, and one secret.

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

`Env` in `src/main.rs` derives `ocel::Env`. `greeting` falls back to `hello`; `api_key` is an `ocel::Secret`, whose value is read with `.value()` and never printed. `GET /greeting` and `GET /api-key` (which returns only the key length) show both.

Set values with `ocel env`:

```bash
ocel env set GREETING=hi
ocel env set API_KEY=s3cret
ocel env ls
```

Add `--preview` to address the preview tier instead of production.
