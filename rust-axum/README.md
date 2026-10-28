# rust-axum

A minimal axum server deployed with the CLI alone, no SDK.

## Run it

```bash
cargo fetch
ocel dev -- cargo run
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`src/main.rs` serves `/` and `/api/hello` on `$PORT`. ocel compiles the crate to a static musl binary, so the musl target must be installed: `rustup target add x86_64-unknown-linux-musl` (or `aarch64-unknown-linux-musl`). `Cargo.lock` is committed.
