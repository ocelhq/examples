import Fastify from "fastify";

const app = Fastify();

app.get("/", async () => "Hello from Fastify on Ocel");
app.get("/health", async () => ({ ok: true }));

await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
