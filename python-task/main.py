import os

import ocel
import uvicorn
from fastapi import FastAPI

from infra import Signup, send_welcome

app = FastAPI()


@app.post("/signups", status_code=202)
async def sign_up(signup: Signup):
    run = await send_welcome.trigger_async(signup)
    return {"runId": run.id}


@app.get("/runs/{run_id}")
async def get_run(run_id: str):
    run = await ocel.runs.retrieve_async(run_id)
    return {"status": run.status, "output": run.output, "error": run.error}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
