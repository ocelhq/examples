"use client";

import { createUploadClient } from "ocel/bucket/client";
import { useCallback, useEffect, useState } from "react";
import type { uploads } from "../infra";

// A type-only import: the client is typed from the bucket without pulling server code in.
const client = createUploadClient<typeof uploads>({ url: "/api/upload" });

export function Uploader() {
  const [files, setFiles] = useState<{ key: string }[]>([]);
  const [selected, setSelected] = useState<File[]>([]);

  const refresh = useCallback(async () => {
    setFiles(await (await fetch("/api/files")).json());
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <>
      <input type="file" multiple onChange={(e) => setSelected([...(e.target.files ?? [])])} />
      <button
        onClick={async () => {
          await client.upload("document", { files: selected });
          await refresh();
        }}
      >
        Upload
      </button>
      <ul>
        {files.map(({ key }) => (
          <li key={key}>
            <a href={`/api/files/download?key=${encodeURIComponent(key)}`}>{key}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
