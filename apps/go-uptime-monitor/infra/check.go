package infra

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5"
	"ocel.dev/kv"
	"ocel.dev/runs"
	"ocel.dev/task"
	"ocel.dev/topic"
)

var client = &http.Client{Timeout: 10 * time.Second}

func sweep(ctx context.Context, tick Tick) (int, error) {
	pool, err := Pool(ctx)
	if err != nil {
		return 0, err
	}
	rows, err := pool.Query(ctx, `SELECT id, url FROM monitors`)
	if err != nil {
		return 0, err
	}
	targets, err := pgx.CollectRows(rows, pgx.RowToStructByPos[Target])
	if err != nil || len(targets) == 0 {
		return 0, err
	}
	triggers := make([]task.Trigger[Target], len(targets))
	for i, target := range targets {
		// A retried sweep sends the same keys, so no monitor is probed twice in one minute.
		key := fmt.Sprintf("probe-%d-%s", target.ID, tick.Timestamp)
		triggers[i] = task.Trigger[Target]{Payload: target, Options: []task.TriggerOption{task.IdempotencyKey(key)}}
	}
	if _, err := Probe.BatchTrigger(ctx, triggers...); err != nil {
		return 0, err
	}
	return len(targets), nil
}

func probe(ctx context.Context, target Target) (Check, error) {
	check := get(ctx, target.URL)
	pool, err := Pool(ctx)
	if err != nil {
		return check, err
	}
	tag, err := pool.Exec(ctx, `
		INSERT INTO checks (monitor_id, at, up, status, error, latency_ms)
		SELECT $1, $2, $3, NULLIF($4, 0), NULLIF($5, ''), $6
		WHERE EXISTS (SELECT 1 FROM monitors WHERE id = $1)`,
		target.ID, check.At, check.Up, check.Status, check.Error, check.LatencyMS)
	if err != nil || tag.RowsAffected() == 0 {
		return check, err
	}

	previous, err := Latest.Get(ctx, target.ID)
	switch {
	case errors.Is(err, kv.ErrMiss):
	case err != nil:
		return check, err
	case previous.Up != check.Up:
		run, _ := runs.FromContext(ctx)
		// Keyed by the run: if the Set below fails and the run is retried, nobody is paged twice.
		incident := Incident{Target: target, Up: check.Up, Reason: check.reason(), At: check.At}
		if _, err := Incidents.Send(ctx, incident, topic.IdempotencyKey("incident-"+run.ID)); err != nil {
			return check, err
		}
	}
	return check, Latest.Set(ctx, target.ID, check)
}

func get(ctx context.Context, url string) Check {
	start := time.Now()
	check := Check{At: start.UTC()}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err == nil {
		var resp *http.Response
		if resp, err = client.Do(req); err == nil {
			resp.Body.Close()
			check.Status = resp.StatusCode
			check.Up = resp.StatusCode < 400
		}
	}
	if err != nil {
		check.Error = err.Error()
	}
	check.LatencyMS = time.Since(start).Milliseconds()
	return check
}

func (c Check) reason() string {
	if c.Error != "" {
		return c.Error
	}
	return fmt.Sprintf("HTTP %d", c.Status)
}

func alert(ctx context.Context, incident Incident) error {
	state := "down"
	if incident.Up {
		state = "up"
	}
	text := fmt.Sprintf("%s is %s (%s)", incident.URL, state, incident.Reason)
	log.Print(text)
	if Env.AlertWebhook == nil {
		return nil
	}
	body, _ := json.Marshal(map[string]string{"text": text})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, *Env.AlertWebhook, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("content-type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("alert webhook answered %s", resp.Status)
	}
	return nil
}
