import os
import uuid
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

import ocel
from infra import db, images, uploaded


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await db.fetch(
        """
        create table if not exists images (
            id uuid primary key,
            filename text not null,
            status text not null default 'pending',
            error text,
            created_at timestamptz not null default now()
        )
        """
    )
    yield


app = FastAPI(lifespan=lifespan)


@app.post("/images", status_code=202)
async def upload(file: UploadFile):
    image_id = str(uuid.uuid4())
    await images.put_async(f"originals/{image_id}", await file.read(), content_type=file.content_type)
    await db.fetch(
        "insert into images (id, filename) values ($1::uuid, $2)", image_id, file.filename
    )
    await uploaded.send_async({"image_id": image_id})
    return {"id": image_id, "status": "pending"}


@app.get("/images/{image_id}")
async def status(image_id: str):
    rows = await db.fetch(
        "select id::text, filename, status, error from images where id::text = $1", image_id
    )
    if not rows:
        raise HTTPException(404, "no such image")
    return dict(rows[0])


@app.get("/images/{image_id}/thumbnail")
async def thumbnail(image_id: str):
    try:
        body = await images.get_async(f"thumbnails/{image_id}.jpg")
    except ocel.ObjectNotFound:
        raise HTTPException(404, "the thumbnail is not ready yet") from None
    return StreamingResponse(body, media_type="image/jpeg")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
