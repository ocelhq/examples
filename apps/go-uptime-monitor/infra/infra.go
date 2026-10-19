package infra

import (
	"time"

	"ocel.dev"
)

type Target struct {
	ID  int64  `json:"id"`
	URL string `json:"url"`
}

type Check struct {
	Up        bool      `json:"up"`
	Status    int       `json:"status,omitempty"`
	Error     string    `json:"error,omitempty"`
	LatencyMS int64     `json:"latencyMs"`
	At        time.Time `json:"at"`
}

type Incident struct {
	Target
	Up     bool      `json:"up"`
	Reason string    `json:"reason"`
	At     time.Time `json:"at"`
}

// Tick is what a cron run is handed: the minute it was scheduled for.
type Tick struct {
	Timestamp string `json:"timestamp"`
}

var DB = ocel.Postgres("uptime")

var Cache = ocel.KV("cache")

var Latest = ocel.KVJSON[int64, Check](Cache, "latest", "latest/:monitor")

var Env = ocel.Env[struct {
	AlertWebhook *string `ocel:"ALERT_WEBHOOK_URL,sensitive"`
}]()

var Incidents = ocel.Topic[Incident]("incidents")

var Alert = Incidents.Consumer("alert", alert, ocel.Retry(ocel.RetryPolicy{
	MaxAttempts: 5,
	MinDelay:    10 * time.Second,
	MaxDelay:    5 * time.Minute,
}))

var Probe = ocel.Task("probe", probe, ocel.MaxDuration(30*time.Second), ocel.Concurrency(20))

var Sweep = ocel.Task("sweep", sweep, ocel.Cron("* * * * *"))
