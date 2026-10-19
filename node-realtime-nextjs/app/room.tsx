"use client";

import { createRealtimeClient } from "ocel/realtime/client";
import { useEffect, useState } from "react";
import type { rt } from "../infra";

// A type-only import: the client is typed from the channels without pulling server code in.
const live = createRealtimeClient<typeof rt>({ url: "/api/realtime" });

export function Room() {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");

  useEffect(
    () =>
      live.subscribe("rooms/:roomId", { params: { roomId: "lobby" } }, (event) =>
        setMessages((previous) => [event.text, ...previous]),
      ),
    [],
  );

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/messages", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ text }),
          });
          setText("");
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something" required />
        <button>Send</button>
      </form>
      <ul>
        {messages.map((message, i) => (
          <li key={i}>{message}</li>
        ))}
      </ul>
    </>
  );
}
