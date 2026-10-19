# go-topic

A topic with two consumers. A topic is a stream of messages: every message sent to it fans out, and each consumer handles its own copy independently, retried on error.

## Run it

```bash
go mod download
ocel dev
```

```bash
curl -X POST localhost:3000/orders -d '{"id":"o-1","total":42}'
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The topic and its consumers are declared in [`infra/infra.go`](infra/infra.go) with `ocel.Topic` and `Orders.Consumer`; [`main.go`](main.go) publishes with `Orders.Send` in `POST /orders`. Both consumers log the order, so watch the `ocel dev` output. `GET /failed/receipts` reads the dead letters of the `receipts` consumer, the messages it gave up on. Unlike a [task](https://github.com/ocelhq/examples/tree/main/go-task), a send has no result to wait for, and nothing in the sender names who consumes it.
