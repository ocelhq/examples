package infra

import (
	"context"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
)

var schema = []string{
	`CREATE TABLE IF NOT EXISTS monitors (
		id bigserial PRIMARY KEY,
		url text NOT NULL,
		created_at timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE TABLE IF NOT EXISTS checks (
		id bigserial PRIMARY KEY,
		monitor_id bigint NOT NULL REFERENCES monitors ON DELETE CASCADE,
		at timestamptz NOT NULL,
		up boolean NOT NULL,
		status int,
		error text,
		latency_ms bigint NOT NULL
	)`,
	`CREATE INDEX IF NOT EXISTS checks_monitor_at ON checks (monitor_id, at DESC)`,
}

var (
	migrateMu sync.Mutex
	migrated  bool
)

// Pool is the database with its tables in place. The API and the worker both
// come through here, and either may be the first to touch the database.
func Pool(ctx context.Context) (*pgxpool.Pool, error) {
	pool, err := DB.Pool(ctx)
	if err != nil {
		return nil, err
	}
	migrateMu.Lock()
	defer migrateMu.Unlock()
	if !migrated {
		for _, stmt := range schema {
			if _, err := pool.Exec(ctx, stmt); err != nil {
				return nil, err
			}
		}
		migrated = true
	}
	return pool, nil
}
