import { topic } from "ocel/topic";

export const orders = topic<{ item: string; quantity: number }>("orders");

export const fulfil = orders.consumer("fulfil", (order, { ctx }) => {
  console.log(`fulfilling ${order.quantity} x ${order.item} (message ${ctx.message.id})`);
});
