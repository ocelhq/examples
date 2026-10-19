import os

import uvicorn
from fastapi import FastAPI, HTTPException

from infra import Profile, profiles, visits

app = FastAPI()


@app.put("/users/{user}")
async def save_profile(user: str, profile: Profile):
    await profiles.set_async(profile, user=user)
    return profile


@app.get("/users/{user}")
async def get_profile(user: str):
    profile = await profiles.get_async(user=user)
    if profile is None:
        raise HTTPException(status_code=404, detail=f"no profile for {user}")
    count = await visits.increment_async(user=user)
    return {"profile": profile, "visits": count}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
