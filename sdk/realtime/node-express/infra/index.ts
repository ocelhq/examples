import { realtime } from "ocel/realtime/express";
import { z } from "zod";

export const rt = realtime("app", {
  channels: {
    "rooms/:roomId": {
      schema: z.object({ text: z.string() }),
      subscribe: "public",
    },
  },
});
