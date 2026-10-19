import os

import ocel
import uvicorn
from fastapi import FastAPI

from infra import Report, build_report

app = FastAPI()


@app.post("/reports", status_code=202)
async def request_report(report: Report):
    run = await build_report.trigger_async(report)
    return {"runId": run.id}


@app.get("/reports/{run_id}")
async def get_report(run_id: str):
    run = await ocel.runs.retrieve_async(run_id)
    return {"status": run.status, "output": run.output}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
