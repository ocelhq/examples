import asyncio

import ocel
from pydantic import BaseModel


class Signup(BaseModel):
    email: str


@ocel.task("send-welcome", retry=ocel.Retry(max_attempts=3))
async def send_welcome(signup: Signup, ctx: ocel.RunContext) -> dict:
    await asyncio.sleep(2)
    return {"sentTo": signup.email, "attempt": ctx.attempt.number}
