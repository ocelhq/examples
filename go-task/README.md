# go-task

A task: one unit of background work that you trigger with a payload and that returns a result. Triggering returns a run id immediately and the work happens elsewhere.

## Run it

```bash
go mod download
ocel dev -- go run .
```

```bash
curl -X POST localhost:3000/reports -d '{"text":"one two three"}'
curl localhost:3000/runs/<runId>
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

The task is declared in [`infra/infra.go`](infra/infra.go) with `task.New`, typed by its payload and result; [`main.go`](main.go) starts a run with `Summarize.Trigger` in `POST /reports` and reads it back with `runs.Retrieve` in `GET /runs/{id}`. A task has one handler and one caller per trigger, unlike a [topic](https://github.com/ocelhq/examples/tree/main/go-topic), where a message fans out to every consumer. The task runs on the default worker; see [go-worker](https://github.com/ocelhq/examples/tree/main/go-worker) to place it on one you declare.
