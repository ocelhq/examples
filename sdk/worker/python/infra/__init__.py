import asyncio

import ocel
from pydantic import BaseModel


async def connect() -> None:
    print("worker process started")


async def log_run(ctx: ocel.RunContext, next):
    print(f"{ctx.kind} {ctx.name} starting")
    return await next()


background = ocel.worker("background", concurrency=2, on_start=connect, middleware=log_run)


class Report(BaseModel):
    month: str


@ocel.task("build-report", worker=background, max_duration=60)
async def build_report(report: Report, ctx: ocel.RunContext) -> dict:
    await asyncio.sleep(5)
    return {"month": report.month, "rows": 1200}
