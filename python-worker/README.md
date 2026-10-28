# python-worker

A task placed on a worker you declare yourself. The worker is the compute that runs tasks and consumers; declaring it is how you cap its concurrency and hook its start-up and every run.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev -- .venv/bin/python main.py
```

```bash
curl -X POST localhost:3000/reports -H "content-type: application/json" -d '{"month":"2026-09"}'
curl localhost:3000/reports/<runId>
```


## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`ocel.worker("background", ...)` in `infra/__init__.py` sets a concurrency of 2 runs per process, an `on_start` hook that runs once per process, and a `middleware` that wraps every run. `build-report` joins it with `worker=background`; `main.py` triggers it. Only one task here, but anything with `worker=background` shares the same cap.
