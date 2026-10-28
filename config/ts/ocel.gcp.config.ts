import { defineConfig } from "ocel/config";
import { cloudflareDns } from "ocel/dns";
import { infisical } from "ocel/env-source";
import gcpProvider from "ocel/providers/gcp";
import { alb } from "ocel/providers/gcp/edge";

const project = "4f1c2e0a-9d3b-4c6e-8a7f-2b5d1e0c9a84";
const auth = { identity: { identityId: "b7d0e3f1-5a2c-4d8e-9b6f-0c1a2d3e4f5a" } };

export default defineConfig({
  slug: "my-app",
  provider: gcpProvider({
    project: "my-project",
    region: "europe-west1",
    // Left off, every project in the tier keeps its records in one shared database.
    ownDatabase: true,
    // Left off, each service answers only on its run.app URL. One load balancer
    // per tier, about $18 a month, serves every project's hostnames.
    edge: alb(),
    dns: cloudflareDns({ zone: "example.com" }),
  }),
  domains: { preview: "*.preview.example.com" },
  apps: [
    {
      name: "web",
      path: "apps/web",
      domains: { production: ["example.com", "www.example.com"] },
    },
    {
      name: "api",
      path: "apps/api",
      compute: {
        container: {
          health: { path: "/health" },
          instances: { min: 0, max: 10 },
        },
      },
      domains: { production: "api.example.com" },
    },
  ],
  discovery: { paths: ["infra", "apps/*/infra"] },
  bindings: {
    postgres: {
      analytics: "@warehouse",
      // Production binds a database you run; every preview provisions its own.
      main: {
        production: {
          host: "db.example.com",
          database: "app",
          username: "app",
          password: { $env: "MAIN_DB_PASSWORD" },
          tls: { mode: "verify-full" },
        },
      },
    },
  },
  envSource: {
    production: infisical({ project, environment: "prod", auth }),
    preview: infisical({ project, environment: "staging", auth, write: "missing" }),
    dev: infisical({ project, environment: "dev" }),
  },
  lifecycle: {
    preBuild: { command: "pnpm db:migrate", app: "api", timeout: "15m" },
  },
  protection: { preview: true },
  transforms: ["./transforms/defaults.transform.ts"],
});
