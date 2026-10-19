# python-env

A FastAPI app that reads a plain variable with a default and a secret. The thing to notice: the variables are the attributes of `class Env(ocel.Env)`, and the class statement is the declaration.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev
```

```bash
cp .env.example .env
```

`ocel dev` reads `.env` for local values. `GET /` returns the greeting and the length of the secret, never the secret.


## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

`infra/__init__.py` declares `greeting` (`GREETING`, default `hello`) and `api_key` (`API_KEY`, an `ocel.Secret`, so no default and its value is read fresh on every `.value`). `main.py` reads them through `Env()`.

For a deployed environment, set values in your own account:

```bash
ocel env set API_KEY=s3cret GREETING=hi
ocel env ls
ocel env set API_KEY=other --preview
```

Every command addresses production unless you pass `--preview`. See `ocel env` in the docs for `get`, `rm`, `history` and the editor (`ocel env ui`).
