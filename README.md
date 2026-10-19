# Ocel examples

Apps you can copy, run with `ocel dev` and ship with `ocel deploy`. [Install the CLI](https://ocel.dev/docs/install) first.

Every directory at the top level is a template that shows one thing: a stack deployed as-is, or one SDK primitive in one language. [`apps/`](apps) holds real apps that put several primitives together. Each one stands alone, so you can copy just the one you want:

```bash
npx giget@latest gh:ocelhq/examples/node-kv my-app
cd my-app && pnpm install && ocel dev
```

Every example is listed in [`examples.json`](examples.json) along with its language, framework and the primitives it uses.

## Stacks

No SDK in these: they show that the CLI ships the stack as it is.

| Stack | Example |
| ----- | ------- |
| Express | [`node-express`](node-express) |
| Hono | [`node-hono`](node-hono) |
| Fastify | [`node-fastify`](node-fastify) |
| NestJS | [`node-nestjs`](node-nestjs) |
| Next.js | [`node-nextjs`](node-nextjs) |
| Go (`net/http`) | [`go-nethttp`](go-nethttp) |
| Python (FastAPI) | [`python-fastapi`](python-fastapi) |
| Rust (axum) | [`rust-axum`](rust-axum) |
| Several apps, one project | [`node-monorepo`](node-monorepo) |
| Your own domain | [`node-custom-domain`](node-custom-domain) |

## Primitives

One SDK primitive per example. Node uses Express unless the primitive has a framework adapter, in which case each adapter gets its own example.

| Primitive | Node | Go | Python | Rust |
| --------- | ---- | -- | ------ | ---- |
| Postgres | [`node-postgres`](node-postgres) | [`go-postgres`](go-postgres) | [`python-postgres`](python-postgres) | [`rust-postgres`](rust-postgres) |
| Bucket | [`node-bucket-express`](node-bucket-express) · [`-hono`](node-bucket-hono) · [`-nextjs`](node-bucket-nextjs) | [`go-bucket`](go-bucket) | [`python-bucket`](python-bucket) | [`rust-bucket`](rust-bucket) |
| KV | [`node-kv`](node-kv) | [`go-kv`](go-kv) | [`python-kv`](python-kv) | [`rust-kv`](rust-kv) |
| Topic | [`node-topic`](node-topic) | [`go-topic`](go-topic) | [`python-topic`](python-topic) | [`rust-topic`](rust-topic) |
| Task | [`node-task`](node-task) | [`go-task`](go-task) | [`python-task`](python-task) | [`rust-task`](rust-task) |
| Worker | [`node-worker`](node-worker) | [`go-worker`](go-worker) | [`python-worker`](python-worker) | [`rust-worker`](rust-worker) |
| Realtime | [`node-realtime-express`](node-realtime-express) · [`-hono`](node-realtime-hono) · [`-nextjs`](node-realtime-nextjs) | [`go-realtime`](go-realtime) | [`python-realtime`](python-realtime) | [`rust-realtime`](rust-realtime) |
| Env & secrets | [`node-env`](node-env) | [`go-env`](go-env) | [`python-env`](python-env) | [`rust-env`](rust-env) |

Bring your own infrastructure: [`node-pulumi`](node-pulumi) and [`node-sst`](node-sst) bind a resource your Pulumi or SST program provisions to an Ocel declaration, and [`node-transforms`](node-transforms) patches what Ocel provisions.

## Apps

| App | Stack | Uses |
| --- | ----- | ---- |
| [`node-file-share`](apps/node-file-share) | Next.js | bucket, postgres, kv |
| [`node-chat`](apps/node-chat) | Hono | realtime, postgres |
| [`go-uptime-monitor`](apps/go-uptime-monitor) | Go (`net/http`) | task (cron), topic, postgres, kv, env |
| [`python-media-pipeline`](apps/python-media-pipeline) | Python (FastAPI) | bucket, topic, postgres |
| [`rust-jobs-api`](apps/rust-jobs-api) | Rust (axum) | task, postgres, kv |

## Adding one

See [CONTRIBUTING.md](CONTRIBUTING.md).
