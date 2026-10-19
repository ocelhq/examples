import { uploads } from "../../../infra";
import { resolveLink } from "../../../lib/files";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const file = await resolveLink(code);
  const object = file && (await uploads.get(file.key));
  if (!file || !object) return new Response("This link has expired.", { status: 404 });

  return new Response(object.body, {
    headers: {
      "content-type": file.mime_type,
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    },
  });
}
