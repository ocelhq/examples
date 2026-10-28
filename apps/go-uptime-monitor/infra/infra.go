package infra

import (
	"time"

	"ocel.dev/env"
	"ocel.dev/kv"
	"ocel.dev/postgres"
	"ocel.dev/task"
	"ocel.dev/topic"
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

var DB = postgres.New("uptime")

var Cache = kv.New("cache")

var Latest = kv.NewJSON[int64, Check](Cache, "latest", "latest/:monitor")

var Env = env.MustDefine[struct {
	AlertWebhook *string `ocel:"ALERT_WEBHOOK_URL,sensitive"`
}]()

var Incidents = topic.New[Incident]("incidents")

var Alert = Incidents.Consumer("alert", alert, topic.Retry{
	MaxAttempts: 5,
	MinDelay:    10 * time.Second,
	MaxDelay:    5 * time.Minute,
})

var Probe = task.New("probe", probe, task.MaxDuration(30*time.Second), task.Concurrency(20))

var Sweep = task.New("sweep", sweep, task.Cron("* * * * *"))
