package infra

import (
	"context"
	"log"
	"time"

	"ocel.dev"
)

type Job struct {
	Seconds int `json:"seconds"`
}

type Result struct {
	Slept int `json:"slept"`
}

var Background = ocel.Worker("worker",
	ocel.OnStart(func(context.Context) error {
		log.Println("worker process started")
		return nil
	}),
)

var Nap = ocel.Task("nap", func(_ context.Context, job Job) (Result, error) {
	time.Sleep(time.Duration(job.Seconds) * time.Second)
	return Result{Slept: job.Seconds}, nil
}, ocel.UseWorker(Background))
