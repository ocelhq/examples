import { rt } from "../../../infra";

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text: string };
  await rt.publish("rooms/:roomId", { params: { roomId: "lobby" }, body: { text } });
  return new Response(null, { status: 204 });
}
