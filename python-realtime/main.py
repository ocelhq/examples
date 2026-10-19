import os

import uvicorn
from fastapi import FastAPI

from infra import Message, live, room

app = FastAPI()

app.mount("/api/realtime", live.asgi())


@app.post("/rooms/{room_id}/messages", status_code=202)
async def say(room_id: str, message: Message):
    await room.publish_async(message, roomId=room_id)
    return {"published": message.text}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
