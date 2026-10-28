package infra

import (
	"context"
	"log"

	"ocel.dev/topic"
)

type Order struct {
	ID    string `json:"id"`
	Total int    `json:"total"`
}

var Orders = topic.New[Order]("orders")

var Receipts = Orders.Consumer("receipts", func(_ context.Context, order Order) error {
	log.Printf("receipt for order %s: %d", order.ID, order.Total)
	return nil
})

var Fulfilment = Orders.Consumer("fulfilment", func(_ context.Context, order Order) error {
	log.Printf("packing order %s", order.ID)
	return nil
})
