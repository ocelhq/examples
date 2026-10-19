import { task } from "ocel/task";

export const resize = task("resize", {
  retry: { maxAttempts: 3, minDelay: "1s", maxDelay: "10s" },
  run: async (payload: { image: string; width: number }) => {
    return { image: payload.image, width: payload.width, resizedAt: new Date().toISOString() };
  },
});
