package infra

import (
	"context"
	"strings"

	"ocel.dev/task"
)

type Report struct {
	Text string `json:"text"`
}

type Summary struct {
	Words int `json:"words"`
}

var Summarize = task.New("summarize", func(_ context.Context, report Report) (Summary, error) {
	return Summary{Words: len(strings.Fields(report.Text))}, nil
})
