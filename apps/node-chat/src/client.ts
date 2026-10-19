import { createRealtimeClient } from "ocel/realtime/client";
import type { live } from "../infra";

const client = createRealtimeClient<typeof live>({ url: "/api/realtime" });

const roomInput = document.querySelector<HTMLInputElement>("#room")!;
const nameInput = document.querySelector<HTMLInputElement>("#name")!;
const textInput = document.querySelector<HTMLInputElement>("#text")!;
const log = document.querySelector<HTMLUListElement>("#log")!;
const joinForm = document.querySelector<HTMLFormElement>("#join")!;
const sendForm = document.querySelector<HTMLFormElement>("#send")!;

let stop: (() => void) | undefined;
let room = "";

function show(message: { author: string; text: string }) {
  const item = document.createElement("li");
  const author = document.createElement("strong");
  author.textContent = message.author;
  item.append(author, ` ${message.text}`);
  log.append(item);
  log.scrollTop = log.scrollHeight;
}

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  stop?.();
  log.replaceChildren();
  room = roomInput.value.trim();
  if (!room) return;

  stop = client.subscribe("rooms/:room", { params: { room } }, show);
  const history = await fetch(`/api/rooms/${encodeURIComponent(room)}/messages`);
  for (const message of await history.json()) show(message);
});

sendForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!room || !textInput.value.trim()) return;
  await fetch(`/api/rooms/${encodeURIComponent(room)}/messages`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ author: nameInput.value || "anonymous", text: textInput.value }),
  });
  textInput.value = "";
});
