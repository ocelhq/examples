package infra

import "ocel.dev/kv"

var Cache = kv.New("cache")

var Hits = kv.NewCounter[string](Cache, "hits", "hits/:page")
