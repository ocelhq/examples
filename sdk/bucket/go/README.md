# sdk/bucket/go

An object bucket with a route that uploads and routes that read back. The bucket handle needs no client or endpoint: `Uploads.WriteAll` and `Uploads.NewReader` talk to whatever store the deploy provisioned.

## Run it

```bash
go mod download
ocel dev
```

```bash
curl -X PUT localhost:3000/files/notes/hello.txt -H "content-type: text/plain" -d "hello"
curl localhost:3000/files/notes/hello.txt
curl "localhost:3000/files?prefix=notes/"
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The bucket is declared in [`infra/infra.go`](infra/infra.go) with `ocel.Bucket("uploads")`; [`main.go`](main.go) writes with `WriteAll`, streams back with `NewReader` (a missing key is `ocel.ErrObjectNotFound`) and lists with `List`.
