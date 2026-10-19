# Contributing an example

Every example is something a stranger clones, runs `ocel dev` in, and reads in five
minutes. These rules keep fifty-odd of them consistent and cheap to keep working.

## Where it goes

| Kind      | Path                     | Shows                                   | SDK  |
| --------- | ------------------------ | --------------------------------------- | ---- |
| stack     | `<lang>-<stack>`         | that the CLI deploys this stack as-is   | none |
| primitive | `<lang>-<primitive>`     | one SDK primitive, and nothing else     | one  |
| app       | `apps/<lang>-<use-case>` | a real app composing several primitives | many |

- `<lang>` is `node`, `go`, `python` or `rust`. `<primitive>` is the SDK's own name for
  it: `bucket`, `env`, `kv`, `postgres`, `realtime`, `task`, `topic`, `worker`. A stack is
  named for its framework: `node-express`, `go-nethttp`, `python-fastapi`, `rust-axum`.
- A node primitive with a framework adapter (`ocel/bucket/*`, `ocel/realtime/*`) gets one
  directory per adapter, suffixed with it: `node-bucket-express`, `node-bucket-hono`,
  `node-bucket-nextjs`. Any other node primitive uses Express and has no suffix.
- A framework variant earns a directory only when Ocel treats it differently. Go, Python
  and Rust have no framework layer in Ocel, so they get one each: `net/http` for Go,
  FastAPI for Python, axum for Rust.
- An app's name says what it does (`go-uptime-monitor`, not `go-app`). Every language
  has at least one.

## One name, everywhere

A name is unique across the whole repo, `apps/` included, so the name alone finds any
example. The directory, the `ocel.json` slug, the `package.json` name, the Go module
(`example.com/<name>`), the crate name and the README title are all that one string. A
tool that copies an example out (`giget` today, `ocel init --example <name>` later)
renames the project by replacing it.

Each example stands alone, because it is copied out alone:

- It has its own `.gitignore`: build output for its language, then `.ocel/`, `.env`,
  `.env.*` and `!.env.example`. JS lockfiles and `ocel.lock` stay ignored only in the root
  `.gitignore`, so a copied project keeps the ones it generates.
- Its README links to other examples by absolute URL
  (`https://github.com/ocelhq/examples/tree/main/<name>`), never `../`.
- It is listed in [`examples.json`](examples.json) with its `kind`, `lang`, `framework`,
  the primitives it `uses` and a one-sentence `description`, and linked from the root
  `README.md`.

`python3 scripts/check.py` checks all of this.

## What every example has

- **`README.md`**, in this shape:

  ````md
  # <name, e.g. rust-kv>

  One or two sentences: what this shows, and the one thing worth noticing.

  ## Run it

  ```bash
  <install step>
  ocel dev
  ```

  ## Deploy it

  ```bash
  ocel deploy
  ```

  `ocel destroy` takes it down again.

  ## How it works

  Short. Point at the file where the resource is declared and the file where it is used.
  ````

- **`ocel.json`**, as small as it can be. No `provider`: `ocel deploy` asks for one, and
  the README never tells the reader which to pick. Leave `apps` off when there is one app
  at the project root.

  ```json
  {
    "$schema": "https://ocel.dev/schema/ocel.schema.json",
    "slug": "rust-kv"
  }
  ```

- **The published SDK at a pinned version**, never a path or workspace link:
  `ocel@0.0.2` (npm), `ocel-sdk = "0.0.2"` (crates.io, imported as `ocel`),
  `ocel==0.0.2` (PyPI), `ocel.dev v0.0.2` (Go). An SDK only works with the CLI of its own
  release, so every example pins the same version, and the repo is tagged `v<version>`
  when they all move to it. The CLI is not a dependency; the README assumes `ocel` is
  installed.

## What no example has

- Provider files (`ocel.vps.json`, `ocel.gcp.json`, …), hosts, IPs, account ids, domains
  that aren't placeholders.
- Test scaffolding: probes, nonce headers, anything that exists for a suite rather than
  the reader. Examples are not `tests/fixtures`, and nothing is copied from there without
  stripping that out.
- Lockfiles for JS (`package-lock.json`, `pnpm-lock.yaml`, …), so any package manager
  works. Go keeps `go.sum` and Rust keeps `Cargo.lock`.
- Build output, `node_modules`, `target`, `.venv`, `.ocel`, and `ocel.lock`, which pins
  provider binaries to one CLI version and goes stale on the next (see `.gitignore`).

## Code

- Small but real: a route that writes and a route that reads, not a declaration alone.
- Declarations live in the discovery folder (`infra/` by default) exactly as the docs at
  ocel.dev show them, and the app imports them from there. Rust declares in-crate with
  `#[derive(ocel::Resources)]`.
- Apps listen on `$PORT`. Python apps are served as `python3 main.py` from
  `requirements.txt`, so `main.py` starts its own server.
- No comments restating the code. A comment says why, or points at the one Ocel-specific
  line worth noticing.

## When Ocel gets in the way

Write the example the way a user would, following the docs and the stack's own idioms. If
Ocel can't build or run it, that is a bug in Ocel: leave the example as it is, file the
gap on [ocelhq/ocel](https://github.com/ocelhq/ocel/issues), and fix it there. No extra
config, renamed files, inlined assets or README caveats to get around it.

## Before you call it done

1. The language's own check passes: `tsc --noEmit`, `go build ./...`, `cargo check`,
   `python3 -c "import main"` inside a venv.
2. `ocel build` succeeds. With no provider in `ocel.json` it can't pick a compute
   target, so build against a throwaway config beside the real one and delete it after:

   ```bash
   jq '. + {provider: "aws"}' ocel.json > ocel.verify.json
   ocel build -c ocel.verify.json && rm ocel.verify.json
   ```

   The summary must say it built at least one function per app — `Built 0 functions`
   means the app was not detected. A failure here is an Ocel gap (see above), not a
   reason to change the example.
3. `python3 scripts/check.py` passes: the example is in `examples.json` and the root
   `README.md`, and its names line up.
