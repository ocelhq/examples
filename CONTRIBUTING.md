# Contributing an example

Every example is something a stranger clones, runs `ocel dev` in, and reads in five
minutes. These rules keep forty-odd of them consistent and cheap to keep working.

## Where it goes

| Tier       | Path                     | Shows                                         | SDK  |
| ---------- | ------------------------ | --------------------------------------------- | ---- |
| `deploy/`  | `deploy/<stack>`         | that the CLI deploys this stack as-is         | none |
| `sdk/`     | `sdk/<primitive>/<lang>` | one SDK primitive, and nothing else           | one  |
| `apps/`    | `apps/<name>`            | a real app composing several primitives       | many |

- `<lang>` is `node`, `go`, `python` or `rust`. A node primitive with a framework adapter
  (`ocel/bucket/*`, `ocel/realtime/*`) gets one directory per adapter instead:
  `node-express`, `node-hono`, `nextjs`. A plain `node` example uses Express.
- A framework variant earns a directory only when Ocel treats it differently. Go, Python
  and Rust have no framework layer in Ocel, so they get one each: `net/http` for Go,
  FastAPI for Python, axum for Rust.

## What every example has

- **`README.md`**, in this shape:

  ````md
  # <path, e.g. sdk/kv/rust>

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
    "$schema": "https://ocel.dev/schema/0.0.1/ocel.schema.json",
    "slug": "sdk-kv-rust"
  }
  ```

  The slug is the example's path with `/` replaced by `-`.

- **The published SDK at a pinned version**, never a path or workspace link:
  `ocel@0.0.1` (npm), `ocel-sdk = "0.0.1"` (crates.io, imported as `ocel`),
  `ocel==0.0.1` (PyPI), `ocel.dev v0.0.1` (Go). The CLI is not a dependency; the README
  assumes `ocel` is installed.

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
3. The example appears in the table in the root `README.md`.
