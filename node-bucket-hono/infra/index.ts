import { bucket, uploader } from "ocel/bucket/hono";

export const uploads = bucket("uploads", {
  uploaders: {
    document: uploader(
      { middleware: () => ({}) },
      {
        accept: ["image/*", "application/pdf", "text/plain"],
        limits: { maxFileCount: 5, maxFileSize: 10 * 1024 * 1024 },
        path: { prefix: "documents/", randomSuffix: true },
        onUploadComplete: ({ file }) => {
          console.log("uploaded", file.key, file.size);
        },
      },
    ),
  },
});
