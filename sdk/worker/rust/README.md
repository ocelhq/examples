# sdk/worker/rust

A named worker with its own settings, serving both a task and a topic consumer. The worker is the compute behind background work.

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

A **worker** is the compute that runs tasks and consumers. Ocel starts the same binary as a worker, and it serves its tasks and consumers instead of entering `main`. A **task** is a function you trigger with a payload and read the result of; a **topic** fans a message out to its consumers and returns nothing. Both name the worker they run on with `worker = "..."`, and use the one called `worker` otherwise.

`Infra` in `src/main.rs` declares the `media` worker with a concurrency limit, an `on_start` hook and a middleware that wraps every run. `render` (a task) and `announce` (a consumer of `renders`) both run on it. `POST /renders` (`{"scene": "..."}`) sends to the topic and triggers the task, and `GET /renders/<id>` reads the task run.
