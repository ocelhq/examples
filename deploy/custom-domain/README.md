# deploy/custom-domain

A tiny Express app that is served on your own domain.

## Run it

```bash
pnpm install
ocel dev
```

## Deploy it

```bash
ocel deploy
```

`ocel destroy` takes it down again.

## How it works

The only Ocel line is `domains` in `ocel.json`. `app.example.com` is a placeholder: change it to a domain you own. `production` is the environment the domain belongs to.

DNS stays with you. Ocel serves the app under that hostname, and you point the name at it with a record at your DNS provider; which record depends on where you deployed.
