import { uploads } from "../../../infra";

export const dynamic = "force-dynamic";

export async function GET() {
  const files = [];
  for await (const object of uploads.list({ prefix: "documents/" })) {
    files.push({ key: object.key });
  }
  return Response.json(files);
}
