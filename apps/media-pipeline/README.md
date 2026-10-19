# apps/media-pipeline

Upload an image to a FastAPI app and get a thumbnail back, made in the background. The one thing worth noticing: the upload route only stores the original and publishes a message; a topic consumer does the resizing, so a slow or failing image never holds up a request.

## Run it

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
ocel dev
```

```bash
curl -F file=@photo.jpg localhost:8000/images
curl localhost:8000/images/<id>
curl localhost:8000/images/<id>/thumbnail -o thumb.jpg
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## Architecture

| Resource | Declared in | Why it is here |
| --- | --- | --- |
| Bucket `images` | `infra/__init__.py` | Holds the originals under `originals/` and the results under `thumbnails/`. |
| Postgres `media` | `infra/__init__.py` | One row per image with its status: `pending`, `ready` or `failed`. The table is created when the app starts. |
| Topic `image-uploaded` | `infra/__init__.py` | Hands each upload to the consumer, which retries a failed attempt up to three times. |
| Consumer `thumbnail` | `infra/__init__.py` | Reads the original, resizes it with Pillow (`thumbnails.py`), writes the thumbnail and sets the status. It runs on the default worker. |

## How it works

`infra/__init__.py` declares the bucket, the database, the topic and the consumer. `main.py` is the API: `POST /images` stores the file, inserts the row and calls `uploaded.send_async`; the two `GET` routes read the status from Postgres and stream the thumbnail from the bucket.
