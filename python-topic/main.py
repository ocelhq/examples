import os

import uvicorn
from fastapi import FastAPI

from infra import Order, email_receipt, orders

app = FastAPI()


@app.post("/orders", status_code=202)
async def place_order(order: Order):
    message_id = await orders.send_async(order, idempotency_key=order.id)
    return {"messageId": message_id}


@app.get("/orders/failed")
async def failed_receipts():
    return {"deadLetters": await orders.dead_letter(email_receipt).count_async()}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
