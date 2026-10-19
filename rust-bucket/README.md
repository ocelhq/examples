# rust-bucket

An object bucket declared as a struct field, written and read from an axum app. The declaration is the provisioning step.

## Run it

```bash
ocel dev
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

`Infra` in `src/main.rs` declares the `uploads` bucket. `PUT /files/<key>` stores the request body with `uploads.put`, `GET /files/<key>` reads it back with `uploads.get`, and `GET /files` lists the keys.
