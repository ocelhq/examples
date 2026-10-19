import ocel
from pydantic import BaseModel

cache = ocel.kv("cache")


class Profile(BaseModel):
    name: str
    plan: str


profiles = cache.json("profile", "profile/:user", model=Profile, ttl="1h")
visits = cache.counter("visits", "visits/:user")
