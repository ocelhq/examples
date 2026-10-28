package infra

import "ocel.dev/realtime"

type Message struct {
	From string `json:"from"`
	Text string `json:"text"`
}

type RoomParams struct {
	Room string `realtime:"room"`
}

var Live = realtime.New("app")

var Chat = realtime.NewChannel[Message, RoomParams](Live, "rooms/:room",
	realtime.ChannelSubscribePublic(),
)
