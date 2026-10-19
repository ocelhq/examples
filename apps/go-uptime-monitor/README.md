# go-uptime-monitor

Register URLs and get told when one goes down or comes back. The one thing worth noticing: nothing in the app runs a scheduler or a loop; a cron task fans out one probe run per monitor every minute, and an incident is just a message sent when a probe sees the state flip.

## Run it

```bash
go mod download
ocel dev
```

```bash
curl -X POST localhost:3000/monitors -d '{"url":"https://example.com"}'
curl localhost:3000/monitors
curl localhost:3000/monitors/1
curl -X DELETE localhost:3000/monitors/1
```

A new monitor is probed straight away, then once a minute by the sweep. Incidents show up as log lines in the `ocel dev` output; point a monitor at a URL that answers `500` to see one.

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again. To have incidents posted somewhere, give the app a webhook that takes `{"text": "..."}`, a Slack incoming webhook for one:

```bash
ocel env set ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## Architecture

| Resource | Declared in | Why it is here |
| --- | --- | --- |
| Postgres `uptime` | `infra/infra.go` | The monitors, and every check ever made, for history and 24-hour uptime. The tables are created on first use (`infra/db.go`). |
| KV `cache`, entry `latest` | `infra/infra.go` | The latest check per monitor, so `GET /monitors` reads one key per monitor instead of scanning `checks`, and a probe knows the state it is comparing against. |
| Task `sweep` | `infra/infra.go` | Runs on `Cron("* * * * *")`, reads the monitors and triggers one `probe` per monitor in a single batch. |
| Task `probe` | `infra/infra.go` | Fetches one URL, records the check, and sends an incident when up/down differs from the last check. Twenty run at once. |
| Topic `incidents`, consumer `alert` | `infra/infra.go` | Carries state changes to the consumer, which logs them and posts them to `ALERT_WEBHOOK_URL` when set, retrying a webhook that fails. |
| Env `ALERT_WEBHOOK_URL` | `infra/infra.go` | Optional and sensitive: a pointer field, so the app runs without it. |

## How it works

`infra/infra.go` declares every resource; `infra/check.go` holds the code the worker runs: `sweep`, `probe` and `alert`. `main.go` is the API, which only reads and writes monitors and triggers a first probe.

Retries are where the idempotency keys earn their place. A sweep that fails halfway is retried, and each probe it triggers is keyed by monitor and minute, so a monitor is never probed twice for the same tick. An incident is keyed by the probe's run id, so a probe retried after it sent the incident does not send it again.
