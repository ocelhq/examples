# Project configs

One complete config per deploy target, in each format the CLI reads. Every file sets every option you would reasonably set for that target, with placeholder values. The three files of a target are the same document, so pick the format you prefer.

| Target | JSON | YAML | TypeScript |
| ------ | ---- | ---- | ---------- |
| AWS | [`ocel.aws.json`](json/ocel.aws.json) | [`ocel.aws.yaml`](yaml/ocel.aws.yaml) | [`ocel.aws.config.ts`](ts/ocel.aws.config.ts) |
| Google Cloud | [`ocel.gcp.json`](json/ocel.gcp.json) | [`ocel.gcp.yaml`](yaml/ocel.gcp.yaml) | [`ocel.gcp.config.ts`](ts/ocel.gcp.config.ts) |
| VPS | [`ocel.vps.json`](json/ocel.vps.json) | [`ocel.vps.yaml`](yaml/ocel.vps.yaml) | [`ocel.vps.config.ts`](ts/ocel.vps.config.ts) |

- **AWS**: CloudFront and Route 53, pinned ACM certificates, your own KMS key, a serverless app beside a container app, and a waived Next.js need.
- **Google Cloud**: the `alb` edge with records written to Cloudflare, a database of the project's own, and a container app that scales to zero.
- **VPS**: a box behind Cloudflare, reached over SSH, pulling images from a registry, with an R2 bucket bound in production.

You may not need a config at all. With none, `ocel deploy` asks where to deploy and writes one. Logged in to a console that offers Ocel Cloud, a project that names no provider deploys there, so nothing here applies.

## Use one

Copy the file into your project root under the name the CLI looks for: `ocel.json`, `ocel.yaml` or `ocel.config.ts`. Then delete what you don't use. Only `slug` is required, plus `region` on Google Cloud and `ssh` on a VPS.

Or keep the target in the name and point the CLI at it, which lets one project deploy to several targets:

```bash
ocel deploy -c ocel.vps.json
```

`OCEL_CONFIG=ocel.vps.json` does the same. A directory may hold configs for several targets, but only one form of each: `ocel.vps.json` beside `ocel.vps.config.ts` is refused.

A TypeScript config runs on every command that reads it, so each machine and CI job needs `node` and the `ocel` package:

```bash
npm install -D ocel
```

## The placeholders

- `example.com` and its subdomains stand for your own hostnames, `my-project` for your Google Cloud project, and `123456789012` for your AWS account.
- `${DEPLOY_HOST}` and `${REGISTRY_TOKEN}` are read from your shell, or a `.env` beside the config, when the CLI runs.
- `{ "$env": "NAME" }` is an Ocel variable, stored in your own account. Set it with `ocel env set NAME=…`.
- The Infisical project and identity ids are made up. Replace them with your own, or drop `envSource` to keep values in Ocel's own store.
- Each config expects two apps, at `apps/web` and `apps/api`, an `infra/` folder (a discovery path a config names must exist), a `transforms/defaults.transform.ts` module and a `db:migrate` script. Point them at what your project has.

[Configuration](https://ocel.dev/docs/configuration) documents every key, and each provider's page its own options: [AWS](https://ocel.dev/docs/providers/aws), [Google Cloud](https://ocel.dev/docs/providers/gcp), [VPS](https://ocel.dev/docs/providers/vps), [Cloudflare](https://ocel.dev/docs/providers/cloudflare).
