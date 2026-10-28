# python-fastapi

A minimal FastAPI server deployed with the CLI alone, no SDK.

## Run it

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
ocel dev -- .venv/bin/python main.py
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`main.py` serves `/` and `/api/hello` and starts uvicorn itself on `$PORT`, because ocel runs the app as `python3 main.py` with the packages in `requirements.txt` installed.
