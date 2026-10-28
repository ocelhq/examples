package infra

import (
	"context"
	"log"
	"time"

	"ocel.dev/task"
	"ocel.dev/worker"
)

type Job struct {
	Seconds int `json:"seconds"`
}

type Result struct {
	Slept int `json:"slept"`
}

var Background = worker.New("worker",
	worker.OnStart(func(context.Context) error {
		log.Println("worker process started")
		return nil
	}),
)

var Nap = task.New("nap", func(_ context.Context, job Job) (Result, error) {
	time.Sleep(time.Duration(job.Seconds) * time.Second)
	return Result{Slept: job.Seconds}, nil
}, task.UseWorker(Background))
