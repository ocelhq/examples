import { createUploadClient } from "ocel/bucket/client";
import type { uploads } from "../infra/index";

const client = createUploadClient<typeof uploads>({ url: "/api/upload" });

const input = document.querySelector<HTMLInputElement>("#file")!;
const list = document.querySelector<HTMLUListElement>("#files")!;

async function refresh() {
  const files: { key: string }[] = await (await fetch("/api/files")).json();
  list.replaceChildren(
    ...files.map(({ key }) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `/api/files/download?key=${encodeURIComponent(key)}`;
      link.textContent = key;
      item.append(link);
      return item;
    }),
  );
}

document.querySelector("#upload")!.addEventListener("click", async () => {
  await client.upload("document", { files: [...(input.files ?? [])] });
  await refresh();
});

void refresh();
