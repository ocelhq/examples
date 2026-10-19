import { bucket, uploader } from "ocel/bucket/next";
import { kv } from "ocel/kv";
import { postgres } from "ocel/postgres";

export const db = postgres("files");

export const links = kv("links", {
  entries: {
    link: kv.text("link/:code"),
  },
});

export const uploads = bucket("uploads", {
  uploaders: {
    file: uploader(
      { middleware: () => ({}) },
      {
        limits: { maxFileCount: 5, maxFileSize: 50 * 1024 * 1024 },
        path: { prefix: "files/", randomSuffix: true },
        onUploadComplete: async ({ file }) => {
          await db.query(
            "insert into files (key, name, mime_type, size) values ($1, $2, $3, $4)",
            [file.key, file.name, file.mimeType, file.size],
          );
        },
      },
    ),
  },
});
