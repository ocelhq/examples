# sdk/task/rust

A task: a function you trigger with a payload, run by a worker, with a result you can read back later.

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

A **task** is one function triggered by name with a payload. Each trigger is one run, retried by its policy, and the run keeps its status and output. A **topic** (see `sdk/topic/rust`) fans a message out to consumers and returns nothing; a **worker** (see `sdk/worker/rust`) is the compute that runs tasks and consumers, the default one being named `worker`.

`summarize` in `src/main.rs` is declared by `#[ocel::task]`, which replaces the function with a handle. `POST /summaries` (`{"text": "..."}`) calls `summarize.trigger(...)` and returns the run id; `GET /summaries/<id>` reads the run back with `ocel::runs::retrieve`.
