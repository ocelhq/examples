# rust-task

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

A **task** is one function triggered by name with a payload. Each trigger is one run, retried by its policy, and the run keeps its status and output. A **topic** (see [rust-topic](https://github.com/ocelhq/examples/tree/main/rust-topic)) fans a message out to consumers and returns nothing; a **worker** (see [rust-worker](https://github.com/ocelhq/examples/tree/main/rust-worker)) is the compute that runs tasks and consumers, the default one being named `worker`.

`summarize` in `src/main.rs` is declared by `#[ocel::task]`, which replaces the function with a handle. `POST /summaries` (`{"text": "..."}`) calls `summarize.trigger(...)` and returns the run id; `GET /summaries/<id>` reads the run back with `ocel::runs::retrieve`.
