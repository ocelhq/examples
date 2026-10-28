# node-nestjs

A NestJS app with one controller, deployed with no Ocel code in it.

## Run it

```bash
pnpm install && pnpm build
ocel dev -- pnpm dev
```

## Deploy it

```bash
ocel deploy
```

`ocel projects destroy` takes it down again.

## How it works

No SDK and no `ocel` dependency. `src/main.ts` boots the app on `$PORT`, `src/app.controller.ts` holds the routes and `src/app.service.ts` is injected into it.
