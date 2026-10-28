# python-kv

A FastAPI app that caches user profiles and counts reads in an Ocel-provisioned key-value store (Valkey). The thing to notice: entries are declared with a key pattern and a type, so `profiles.set_async(profile, user="ada")` builds the key for you.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev -- .venv/bin/python main.py
```

```bash
curl -X PUT localhost:3000/users/ada -H "content-type: application/json" -d '{"name":"Ada","plan":"pro"}'
curl localhost:3000/users/ada
```

(Use the port `ocel dev` prints.)


## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

The store and its two entries (a `json` entry validated by a pydantic model, and a `counter`) are declared in `infra/__init__.py`; `main.py` reads and writes them. The `ocel[kv,pydantic]` extras bring in redis-py and pydantic.
