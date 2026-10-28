# go-nethttp

A minimal Go `net/http` server deployed with the CLI alone, no SDK.

## Run it

```bash
go mod download
ocel dev -- go run .
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

`main.go` serves `/` and `/api/hello` on `$PORT`. ocel builds the module with the Go toolchain; `go.mod` is what marks the app as Go.
