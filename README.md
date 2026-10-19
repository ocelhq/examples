# Ocel examples

Apps you can clone, run with `ocel dev` and ship with `ocel deploy`. [Install the CLI](https://ocel.dev/docs/install) first.

- **[`deploy/`](deploy)** — plain apps with no SDK. Proof the CLI ships your stack as it is.
- **[`sdk/`](sdk)** — one SDK primitive per example, in every language.
- **[`apps/`](apps)** — real apps that put several primitives together.

## Deploy

| Stack | Example |
| ----- | ------- |
| Next.js | [`deploy/nextjs`](deploy/nextjs) |
| Express | [`deploy/node-express`](deploy/node-express) |
| Hono | [`deploy/node-hono`](deploy/node-hono) |
| Fastify | [`deploy/node-fastify`](deploy/node-fastify) |
| NestJS | [`deploy/nestjs`](deploy/nestjs) |
| Go (`net/http`) | [`deploy/go`](deploy/go) |
| Python (FastAPI) | [`deploy/python`](deploy/python) |
| Rust (axum) | [`deploy/rust`](deploy/rust) |
| Several apps, one project | [`deploy/monorepo`](deploy/monorepo) |
| Your own domain | [`deploy/custom-domain`](deploy/custom-domain) |

## SDK

| Primitive | Node | Go | Python | Rust |
| --------- | ---- | -- | ------ | ---- |
| Postgres | [node](sdk/postgres/node) | [go](sdk/postgres/go) | [python](sdk/postgres/python) | [rust](sdk/postgres/rust) |
| Bucket | [express](sdk/bucket/node-express) · [hono](sdk/bucket/node-hono) · [next](sdk/bucket/nextjs) | [go](sdk/bucket/go) | [python](sdk/bucket/python) | [rust](sdk/bucket/rust) |
| KV | [node](sdk/kv/node) | [go](sdk/kv/go) | [python](sdk/kv/python) | [rust](sdk/kv/rust) |
| Topic | [node](sdk/topic/node) | [go](sdk/topic/go) | [python](sdk/topic/python) | [rust](sdk/topic/rust) |
| Task | [node](sdk/task/node) | [go](sdk/task/go) | [python](sdk/task/python) | [rust](sdk/task/rust) |
| Worker | [node](sdk/worker/node) | [go](sdk/worker/go) | [python](sdk/worker/python) | [rust](sdk/worker/rust) |
| Realtime | [express](sdk/realtime/node-express) · [hono](sdk/realtime/node-hono) · [next](sdk/realtime/nextjs) | [go](sdk/realtime/go) | [python](sdk/realtime/python) | [rust](sdk/realtime/rust) |
| Env & secrets | [node](sdk/env/node) | [go](sdk/env/go) | [python](sdk/env/python) | [rust](sdk/env/rust) |

Bring your own infrastructure: [`sdk/pulumi`](sdk/pulumi) and [`sdk/sst`](sdk/sst) bind a resource your Pulumi or SST program provisions to an Ocel declaration; [`sdk/transforms`](sdk/transforms) patches what Ocel provisions.

## Apps

| App | Stack | Uses |
| --- | ----- | ---- |
| [`apps/file-share`](apps/file-share) | Next.js | bucket, postgres, kv |
| [`apps/chat`](apps/chat) | Hono | realtime, postgres |
| [`apps/media-pipeline`](apps/media-pipeline) | Python | bucket, topic, postgres |
| [`apps/jobs-api`](apps/jobs-api) | Rust | task, postgres, kv |

## Adding one

See [CONTRIBUTING.md](CONTRIBUTING.md).
