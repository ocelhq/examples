import ocel
from pydantic import BaseModel


class Message(BaseModel):
    text: str


live = ocel.realtime("app")

room = live.channel("rooms/:roomId", schema=Message, subscribe="public")
