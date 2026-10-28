# rust-jobs-api

An axum API that accepts jobs, runs them on a worker, and reports their status. The one thing worth noticing: the task, the database and the idempotency store are all declared in `src/main.rs`, and the same binary serves both the API and the worker.

## Run it

```bash
cargo build
ocel dev -- cargo run
```

```bash
curl -X POST localhost:3000/jobs -H 'content-type: application/json' \
  -H 'idempotency-key: order-42' -d '{"rows": 1000}'
curl localhost:3000/jobs/<id>
```

Send the same `Idempotency-Key` again and you get the original job id back with `"replayed": true`.

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## Architecture

| Resource | Declared as | Why it is here |
| --- | --- | --- |
| Postgres `jobs` | `Infra.db` | The record of every job: status, result, the id of its run. Created at startup. |
| Kv `idempotency` | `Infra.keys` with the `IdempotencyKey` entry | Maps an `Idempotency-Key` header to the job it created, for 24 hours. |
| Task `build-report` | `#[ocel::task]` | The work itself. Retried up to three times with backoff, and it writes its progress to Postgres. |

## How it works

`src/main.rs` declares `Infra` with `#[derive(ocel::Resources)]`, the `IdempotencyKey` kv entry and the `build_report` task. `create_job` checks the key in kv, inserts a `jobs` row, triggers the task and stores the run id. `get_job` reads the row and asks `ocel::runs::retrieve` how many attempts the run has made. When Ocel runs the binary as a worker, `#[ocel::main]` serves the task instead of entering `main`.
