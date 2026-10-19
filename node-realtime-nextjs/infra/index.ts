import { realtime } from "ocel/realtime/next";
import { z } from "zod";

export const rt = realtime("app", {
  channels: {
    "rooms/:roomId": {
      schema: z.object({ text: z.string() }),
      subscribe: "public",
    },
  },
});
