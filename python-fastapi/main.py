import os

import uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def index():
    return "Hello from Python"


@app.get("/api/hello")
def hello():
    return {"message": "Hello from Python"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
