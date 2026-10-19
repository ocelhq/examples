package infra

import "ocel.dev"

type Message struct {
	From string `json:"from"`
	Text string `json:"text"`
}

type RoomParams struct {
	Room string `realtime:"room"`
}

var Live = ocel.Realtime("app")

var Chat = ocel.Channel[Message, RoomParams](Live, "rooms/:room",
	ocel.ChannelSubscribePublic(),
)
