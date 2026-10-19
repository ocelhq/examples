# node-worker

An Express 5 app that places a task on a worker of its own with a concurrency cap and middleware.

## Run it

```bash
pnpm install
ocel dev
```

```bash
curl -X POST localhost:$PORT/reports -H 'content-type: application/json' -d '{"month":"2026-03"}'
curl localhost:$PORT/reports/<id>
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

A worker is the process that runs tasks and topic consumers, separate from the web app. Tasks and consumers go on the one named `worker` unless they say otherwise. `infra/index.ts` declares `reports` with `worker("reports", { concurrency: 2, middleware })` and puts the `build-report` task on it with `worker: reports`, so it runs at most two things at once and every run passes through the middleware, which logs how long it took. `src/server.ts` only triggers the task and reads the run back.
