import os

import ocel
import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response

from infra import uploads

app = FastAPI()


@app.put("/files/{name}", status_code=201)
async def put_file(name: str, request: Request):
    info = await uploads.put_async(
        name,
        await request.body(),
        content_type=request.headers.get("content-type", "application/octet-stream"),
    )
    return {"key": info.key, "size": info.size}


@app.get("/files/{name}")
async def get_file(name: str):
    try:
        async with await uploads.get_async(name) as body:
            return Response(await body.bytes(), media_type=body.info.content_type)
    except ocel.ObjectNotFound:
        raise HTTPException(status_code=404, detail=f"no file {name}") from None


@app.get("/files")
async def list_files():
    return [
        {"key": entry.key, "size": entry.size} async for entry in uploads.list_async()
    ]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
