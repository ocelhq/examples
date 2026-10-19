# sdk/postgres/python

A FastAPI app that stores and lists notes in an Ocel-provisioned Postgres database. The thing to notice: there is no connection string anywhere, `ocel.postgres("main")` is the provisioning step.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev
```

```bash
curl -X POST localhost:3000/notes -H "content-type: application/json" -d '{"text":"hello"}'
curl localhost:3000/notes
```

(Use the port `ocel dev` prints.)


## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The database is declared in `infra/__init__.py` and used in `main.py`, which imports `db` from `infra`. `db.fetch(...)` opens an asyncpg pool on first use from the binding Ocel delivers, so the `ocel[postgres]` extra in `requirements.txt` is what pulls in asyncpg. `main.py` creates the `notes` table on startup. Discovery only runs `infra/`, never `main.py`.
