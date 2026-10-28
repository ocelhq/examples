package infra

import "ocel.dev/postgres"

var DB = postgres.New("main")
