import os

import uvicorn
from fastapi import FastAPI

from infra import Env

app = FastAPI()
env = Env()


@app.get("/")
async def index():
    return {"greeting": env.greeting, "apiKeyLength": len(env.api_key.value)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
