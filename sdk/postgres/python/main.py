import os
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel

from infra import db


@asynccontextmanager
async def lifespan(_app: FastAPI):
    pool = await db.pool()
    await pool.execute(
        "create table if not exists notes (id serial primary key, text text not null)"
    )
    yield


app = FastAPI(lifespan=lifespan)


class NewNote(BaseModel):
    text: str


@app.post("/notes", status_code=201)
async def add_note(note: NewNote):
    rows = await db.fetch("insert into notes (text) values ($1) returning id, text", note.text)
    return dict(rows[0])


@app.get("/notes")
async def list_notes():
    rows = await db.fetch("select id, text from notes order by id")
    return [dict(row) for row in rows]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
