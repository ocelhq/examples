import { realtime } from "ocel/realtime/hono";
import { z } from "zod";

export const rt = realtime("app", {
  channels: {
    "rooms/:roomId": {
      schema: z.object({ text: z.string() }),
      subscribe: "public",
    },
  },
});
