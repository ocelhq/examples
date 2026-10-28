import { defineConfig } from "ocel/config";
import { cloudflareDns } from "ocel/dns";
import { cloudflare } from "ocel/edge";
import { infisical } from "ocel/env-source";
import vpsProvider from "ocel/providers/vps";

const project = "4f1c2e0a-9d3b-4c6e-8a7f-2b5d1e0c9a84";
const auth = {
  universal: {
    clientId: { $env: "INFISICAL_CLIENT_ID" },
    clientSecret: { $env: "INFISICAL_CLIENT_SECRET" },
  },
};

export default defineConfig({
  slug: "my-app",
  provider: vpsProvider({
    ssh: {
      host: "${DEPLOY_HOST}",
      user: "deploy",
      identityFile: "~/.ssh/deploy_ed25519",
    },
    // Cloudflare fronts the box and writes its DNS records. Set the zone's
    // SSL mode to Full (strict). Left off, the box serves its hostnames itself.
    edge: cloudflare(),
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
      compute: { container: { health: { path: "/health" } } },
      domains: { production: "api.example.com" },
    },
  ],
  // Left off, each deploy sends the whole image to the box over SSH.
  registry: {
    server: "ghcr.io/acme",
    username: "acme-bot",
    password: "${REGISTRY_TOKEN}",
  },
  discovery: { paths: ["infra", "apps/*/infra"] },
  bindings: {
    bucket: {
      // Production binds an R2 bucket; every preview gets a store on the box.
      uploads: {
        production: {
          endpoint: { $env: "R2_ENDPOINT" },
          region: "auto",
          bucket: "my-app-uploads",
          accessKeyId: { $env: "R2_ACCESS_KEY_ID" },
          secretAccessKey: { $env: "R2_SECRET_ACCESS_KEY" },
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
