import { defineTransform } from "@ocel/transforms";

export default defineTransform([
  { aws: { function: { lambda: { memorySize: 1024, timeout: 30 } } } },
  {
    if: ({ envTier }) => envTier !== "production",
    aws: { bucket: { bucket: { forceDestroy: true } } },
  },
  { tags: { "acme:cost-center": "platform" } },
]);
