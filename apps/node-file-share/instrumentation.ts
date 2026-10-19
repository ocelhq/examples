export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { db } = await import("./infra");
  await db.query(`
    create table if not exists files (
      id         serial primary key,
      key        text not null unique,
      name       text not null,
      mime_type  text not null,
      size       bigint not null,
      created_at timestamptz not null default now()
    )
  `);
}
