# go-realtime

A realtime channel the server publishes to. Browsers subscribe to `rooms/:room` through the handler mounted at `/api/realtime`; the server pushes an event with one call.

## Run it

```bash
go mod download
ocel dev -- go run .
```

```bash
curl -X POST localhost:3000/rooms/lobby/messages -d '{"from":"me","text":"hi"}'
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

The realtime resource and the typed channel are declared in [`infra/infra.go`](infra/infra.go) with `realtime.New` and `realtime.NewChannel`. [`main.go`](main.go) mounts `Live.Handler()`, which authorizes subscriptions and signs the short-lived tokens the transport checks, and publishes in `POST /rooms/{room}/messages`. The channel is `realtime.ChannelSubscribePublic()`, so anyone may subscribe; use `realtime.Authorize` and `realtime.ChannelSubscribe` rules to restrict it.

There is no subscribing page here: Ocel's browser client ships as the `ocel/realtime` npm package, which needs a JS toolchain. See [node-realtime-express](https://github.com/ocelhq/examples/tree/main/node-realtime-express) for one.
