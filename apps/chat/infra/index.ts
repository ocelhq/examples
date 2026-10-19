import { postgres } from "ocel/postgres";
import { realtime } from "ocel/realtime";
import { z } from "zod";

export const Message = z.object({
  id: z.number(),
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

export const db = postgres("chat");

export const live = realtime("chat", {
  channels: {
    "rooms/:room": { schema: Message, subscribe: "public" },
  },
});
