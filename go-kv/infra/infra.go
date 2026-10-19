package infra

import "ocel.dev"

var Cache = ocel.KV("cache")

var Hits = ocel.KVCounter[string](Cache, "hits", "hits/:page")
