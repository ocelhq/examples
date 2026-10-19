import { createRealtimeClient } from "ocel/realtime/client";
import type { rt } from "../infra/index";

const live = createRealtimeClient<typeof rt>({ url: "/api/realtime" });

const list = document.querySelector<HTMLUListElement>("#messages")!;
const input = document.querySelector<HTMLInputElement>("#text")!;

live.subscribe("rooms/:roomId", { params: { roomId: "lobby" } }, (event) => {
  const item = document.createElement("li");
  item.textContent = event.text;
  list.prepend(item);
});

document.querySelector("#form")!.addEventListener("submit", async (e) => {
  e.preventDefault();
  await fetch("/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: input.value }),
  });
  input.value = "";
});
