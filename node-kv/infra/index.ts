import { kv } from "ocel/kv";

export const cache = kv("cache", {
  entries: {
    greeting: kv.text("greeting/:name", { ttl: "30s" }),
    visits: kv.counter("visits/:page"),
  },
});
