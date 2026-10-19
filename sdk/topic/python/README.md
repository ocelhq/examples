# sdk/topic/python

A FastAPI app that publishes orders to a topic with two consumers. A topic fans out: every consumer gets every message, and each retries on its own.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev
```

```bash
curl -X POST localhost:3000/orders -H "content-type: application/json" -d '{"id":"o-1","total":4200}'
curl localhost:3000/orders/failed
```

Both consumers print to the `ocel dev` log. The second route counts messages `email-receipt` gave up on.


## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The topic and both consumers are declared in `infra/__init__.py`, and `main.py` sends with `orders.send_async`. The consumers are not served by `main.py`: they run on a worker, so they live in `infra/`, which Ocel's generated worker entry imports. `idempotency_key` makes a repeated order id publish nothing new.

Topic, task and worker, briefly. A **topic** broadcasts messages to every consumer declared on it (`sdk/topic`). A **task** is one function you start a run of and can look up afterwards (`sdk/task`). A **worker** is the compute either of those runs on, which you only declare to size or customise it (`sdk/worker`).
