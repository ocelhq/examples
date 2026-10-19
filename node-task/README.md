# node-task

An Express 5 app that triggers a background task from a route and reads the run back by id.

## Run it

```bash
pnpm install
ocel dev
```

```bash
curl -X POST localhost:$PORT/resize -H 'content-type: application/json' -d '{"image":"cat.jpg","width":320}'
curl localhost:$PORT/runs/<id>
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

`infra/index.ts` declares the task with `task("resize", { run, retry })`. `src/server.ts` calls `resize.trigger(payload)`, which queues a run and returns its id immediately; the handler runs elsewhere, on the default worker, retrying up to three times on failure. `runs.retrieve(id)` from `ocel/task` reads the run's status (`QUEUED`, `EXECUTING`, `COMPLETED`, ...) and output.
