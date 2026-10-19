import { redirect } from "next/navigation";
import { createLink, listFiles } from "../lib/files";
import { UploadButton } from "./upload-button";

export const dynamic = "force-dynamic";

async function share(formData: FormData) {
  "use server";
  const code = await createLink(
    Number(formData.get("file")),
    formData.get("expires") as "1h" | "1d" | "7d",
  );
  redirect(`/?link=${code}`);
}

export default async function Home({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const { link } = await searchParams;
  const files = await listFiles();

  return (
    <main>
      <h1>File share</h1>
      <UploadButton />
      {link && (
        <p>
          Share link: <a href={`/s/${link}`}>/s/{link}</a>
        </p>
      )}
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            {file.name} ({Math.ceil(Number(file.size) / 1024)} KB)
            <form action={share} style={{ display: "inline", marginLeft: "0.5rem" }}>
              <input type="hidden" name="file" value={file.id} />
              <select name="expires" defaultValue="1d">
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
                <option value="7d">7 days</option>
              </select>{" "}
              <button>Share</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
