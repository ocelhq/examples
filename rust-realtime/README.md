# rust-realtime

A realtime channel that the server publishes on and browsers subscribe to. The declaration is the provisioning step.

## Run it

```bash
ocel dev -- cargo run
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

The `Orders` channel in `src/main.rs` is declared with `#[derive(ocel::Channel)]`. `POST /orders/<id>/events` (`{"status": "shipped"}`) publishes to it with `realtime.publish`. Browsers subscribe through the handler mounted at `/api/realtime`, which runs the `authorize` and `subscribe` rules; the ones here admit everyone, so replace them with your own session check. The browser side is the `ocel` JavaScript realtime client, which this example does not include.
