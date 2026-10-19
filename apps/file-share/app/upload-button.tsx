"use client";

import { createUploadClient } from "ocel/bucket/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { uploads } from "../infra";

const client = createUploadClient<typeof uploads>({ url: "/api/upload" });

export function UploadButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setError(undefined);
    try {
      await client.upload("file", { files });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <p>
      <input type="file" multiple disabled={busy} onChange={onChange} />
      {busy && " Uploading..."}
      {error && <span role="alert"> {error}</span>}
    </p>
  );
}
