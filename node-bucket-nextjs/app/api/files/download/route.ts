import { uploads } from "../../../../infra";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!key.startsWith("documents/")) {
    return new Response(null, { status: 400 });
  }
  const object = await uploads.get(key);
  if (!object) {
    return new Response(null, { status: 404 });
  }
  return new Response(object.body, {
    headers: { "content-type": object.info.contentType || "application/octet-stream" },
  });
}
