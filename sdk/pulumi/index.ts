import { bind } from "@ocel/pulumi";
import * as aws from "@pulumi/aws";
import { Config } from "@pulumi/pulumi";

const password = new Config().requireSecret("dbPassword");

const security = new aws.ec2.SecurityGroup("orders", {
  ingress: [{ protocol: "tcp", fromPort: 5432, toPort: 5432, cidrBlocks: ["0.0.0.0/0"] }],
});

const orders = new aws.rds.Instance("orders", {
  engine: "postgres",
  engineVersion: "17",
  instanceClass: aws.rds.InstanceType.T4G_Micro,
  allocatedStorage: 20,
  dbName: "orders",
  username: "postgres",
  password,
  vpcSecurityGroupIds: [security.id],
  publiclyAccessible: true,
  skipFinalSnapshot: true,
});

bind.postgres("orders", {
  host: orders.address,
  port: orders.port,
  database: orders.dbName,
  username: orders.username,
  password,
});
