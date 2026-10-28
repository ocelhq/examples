import { defineConfig } from "ocel/config";
import { infisical } from "ocel/env-source";
import awsProvider from "ocel/providers/aws";
import { route53 } from "ocel/providers/aws/dns";
import { cloudfront } from "ocel/providers/aws/edge";

const certificate =
  "arn:aws:acm:us-east-1:123456789012:certificate/0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";

const project = "4f1c2e0a-9d3b-4c6e-8a7f-2b5d1e0c9a84";
const auth = { identity: { identityId: "b7d0e3f1-5a2c-4d8e-9b6f-0c1a2d3e4f5a" } };

export default defineConfig({
  slug: "my-app",
  provider: awsProvider({
    region: "eu-west-1",
    edge: cloudfront(),
    dns: route53({ zone: "example.com" }),
    // Hostnames left off get a certificate ocel requests and renews.
    // CloudFront serves only certificates issued in us-east-1.
    certificates: {
      "example.com": certificate,
      "www.example.com": certificate,
    },
    variablesKey: "arn:aws:kms:eu-west-1:123456789012:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    bytecode: { cache: true },
    logs: { liveTail: true },
  }),
  domains: { preview: "*.preview.example.com" },
  apps: [
    {
      name: "web",
      path: "apps/web",
      arch: "arm64",
      domains: { production: ["example.com", "www.example.com"] },
    },
    {
      name: "api",
      path: "apps/api",
      compute: {
        container: {
          health: { path: "/health" },
          instances: { min: 2, max: 10 },
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
      main: { production: { url: { $env: "MAIN_DATABASE_URL" } } },
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
  // A partial prerender's shell and resumed stream both come from the origin,
  // rather than refusing the deploy.
  allowDegraded: ["ppr-resume"],
});
