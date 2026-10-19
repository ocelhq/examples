import ocel
from pydantic import BaseModel


class Order(BaseModel):
    id: str
    total: int


orders = ocel.topic("orders", schema=Order, retry=ocel.Retry(max_attempts=3))


@orders.consumer("email-receipt")
async def email_receipt(order: Order, ctx: ocel.RunContext) -> None:
    print(f"emailing a receipt for order {order.id} (attempt {ctx.attempt.number})")


@orders.consumer("update-stock")
async def update_stock(order: Order, ctx: ocel.RunContext) -> None:
    print(f"taking order {order.id} out of stock")
