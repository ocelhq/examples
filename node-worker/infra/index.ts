import { task } from "ocel/task";
import { worker } from "ocel/worker";

export const reports = worker("reports", {
  concurrency: 2,
  middleware: async ({ ctx, next }) => {
    const startedAt = Date.now();
    await next();
    console.log(`${ctx.kind} ${ctx.name} took ${Date.now() - startedAt}ms`);
  },
});

export const buildReport = task("build-report", {
  worker: reports,
  run: async (payload: { month: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { month: payload.month, rows: 1234 };
  },
});
