package infra

import "ocel.dev"

var Env = ocel.Env[struct {
	Greeting string      `ocel:"GREETING,default=hello"`
	APIKey   ocel.Secret `ocel:"API_KEY"`
}]()
