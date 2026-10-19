# python-bucket

A FastAPI app that uploads, downloads and lists files in an Ocel-provisioned object bucket. The thing to notice: every read and write has an awaited `_async` twin, which is what a FastAPI route wants.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev
```

```bash
curl -X PUT localhost:3000/files/hello.txt -H "content-type: text/plain" --data-binary "hello"
curl localhost:3000/files/hello.txt
curl localhost:3000/files
```

(Use the port `ocel dev` prints.)


## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The bucket is declared in `infra/__init__.py` and used in `main.py`. A read of a missing key raises `ocel.ObjectNotFound`, which the route turns into a 404.
