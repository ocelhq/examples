# rust-topic

A topic and the consumer that handles its messages. The topic fans a message out to every consumer; the consumer runs on a worker, not in the web process.

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

Three Ocel ideas that are easy to mix up:

- A **topic** is a named channel of typed messages. `send` publishes one, and every consumer of the topic gets its own copy, retried independently. It carries no return value.
- A **task** is one function you trigger by name with a payload. It runs once per trigger and has a result you can look up. See [rust-task](https://github.com/ocelhq/examples/tree/main/rust-task).
- A **worker** is the compute that runs tasks and consumers. It is the same binary started as a worker, which serves them instead of entering `main`. See [rust-worker](https://github.com/ocelhq/examples/tree/main/rust-worker).

`Infra` in `src/main.rs` declares the `orders` topic. `log_order`, marked `#[ocel::consumer(topic = Infra::ORDERS)]`, handles each message on the default worker, and its output appears in the worker logs. `POST /orders` (`{"item": "..."}`) sends a message and returns its id; `GET /orders` lists the ids this process sent.
