/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app() {
    return { name: "node-sst", home: "aws" };
  },
  async run() {
    const { bind } = await import("@ocel/sst");
    const vpc = new sst.aws.Vpc("Vpc");
    const orders = new sst.aws.Postgres("Orders", { vpc });

    bind.postgres("orders", orders);
  },
});
