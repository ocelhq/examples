# sdk/task/python

A FastAPI app that hands slow work to a task and looks the run up afterwards. A task is one named function: each `trigger` starts one run, with retries, and returns a handle you can query.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev
```

```bash
curl -X POST localhost:3000/signups -H "content-type: application/json" -d '{"email":"ada@example.com"}'
curl localhost:3000/runs/<runId>
```


## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The task is declared in `infra/__init__.py` and triggered from `main.py` with `send_welcome.trigger_async`. `ocel.runs.retrieve_async` reads the run record (status, output, error). The task body runs on a worker, not in the web process, which is why it lives in `infra/`. Unlike a topic consumer, a task has one handler and one run per trigger.
