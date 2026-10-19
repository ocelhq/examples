import { randomBytes } from "node:crypto";
import { db, links } from "../infra";

export type FileRow = { id: number; key: string; name: string; mime_type: string; size: string };

export async function listFiles(): Promise<FileRow[]> {
  const { rows } = await db.query<FileRow>(
    "select id, key, name, mime_type, size from files order by id desc",
  );
  return rows;
}

export async function findFile(id: number): Promise<FileRow | undefined> {
  const { rows } = await db.query<FileRow>(
    "select id, key, name, mime_type, size from files where id = $1",
    [id],
  );
  return rows[0];
}

export async function createLink(fileId: number, expiresIn: `${number}${"m" | "h" | "d"}`) {
  const code = randomBytes(5).toString("base64url");
  await links.link.set({ code }, String(fileId), { ttl: expiresIn });
  return code;
}

export async function resolveLink(code: string): Promise<FileRow | undefined> {
  const fileId = await links.link.get({ code });
  return fileId === undefined ? undefined : findFile(Number(fileId));
}
