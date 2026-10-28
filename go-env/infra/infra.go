package infra

import "ocel.dev/env"

var Env = env.MustDefine[struct {
	Greeting string     `ocel:"GREETING,default=hello"`
	APIKey   env.Secret `ocel:"API_KEY"`
}]()
