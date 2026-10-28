# go-worker

A worker declared by hand and a task placed on it. A worker is the compute that runs tasks and topic consumers, separate from the web app that triggers them; `OnStart` runs once per worker process before its first run.

## Run it

```bash
go mod download
ocel dev -- go run .
```

```bash
curl -X POST localhost:3000/naps -d '{"seconds":5}'
curl localhost:3000/runs/<runId>
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

The worker and the task are declared in [`infra/infra.go`](infra/infra.go): `worker.New("worker", worker.OnStart(...))`, then `task.UseWorker(Background)` on the task. Anything that declares no worker runs on the one named `worker` anyway, so declare one when you want to give it hooks or tune it. [`main.go`](main.go) triggers and reads runs like [go-task](https://github.com/ocelhq/examples/tree/main/go-task). `nap` sleeps, so a run is visibly `QUEUED` or `EXECUTING` before it is `COMPLETED`.
