# Easypanel ops access

The stack — this app and the Twenty CRM it reads — runs on Easypanel. This
document sets up **ops control from Claude**: reading service logs, restarting
Twenty, inspecting env vars, watching deploys.

This is tooling, not application code. Nothing here is imported by the app, and
the app never talks to Easypanel at runtime.

## Use the official endpoint, not a community wrapper

Easypanel has shipped its own MCP server since **2.33**, mounted at
`/api/mcp` on the panel itself, with further actions added in 2.33.1. Several
third-party Easypanel MCP servers exist on npm and GitHub. Prefer the built-in
one: the token involved is root-equivalent for the server, and handing it to
unaffiliated code published under someone else's npm account is a supply-chain
risk taken for no benefit.

Reach for a community wrapper only for something the official endpoint genuinely
lacks — container `exec` and WebSocket live logs are the usual reasons — and
treat that as a deliberate decision, not a default.

## Setup

1. **Get an API key.** In Easypanel, open your user's settings; the API key and
   its connection instructions sit together. Easypanel accepts it as a Bearer
   token, which is what `.mcp.json` uses.

2. **Export it.** `.mcp.json` in the repo root references `${EASYPANEL_TOKEN}`
   rather than embedding the value, so the key stays out of git:

   ```bash
   export EASYPANEL_TOKEN='...'      # add to your shell profile to persist
   ```

3. **Start a Claude Code session in this repo.** The `easypanel` server is
   picked up from `.mcp.json`; approve it when prompted. Verify with `/mcp`.

## Network reachability

The panel must be reachable from wherever Claude Code runs.

- **Local Claude Code or Desktop** — works directly, assuming the panel is
  reachable from your machine.
- **Claude Code on the web** — outbound traffic goes through an egress proxy
  that denies anything not allowlisted. `k9pirj.easypanel.host` is currently
  denied at CONNECT, so the MCP server cannot connect and neither can the app's
  Twenty client. Add the host in the environment's network egress settings to
  fix both at once. See
  https://code.claude.com/docs/en/claude-code-on-the-web.

A denial here surfaces as a connection failure, not an auth failure. Check
reachability before assuming a token is bad:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://k9pirj.easypanel.host/api/mcp
```

`000` with `CONNECT tunnel failed` is the proxy refusing to forward. Any HTTP
status means the request reached the panel.

## Scope of the token

An Easypanel API key is not comparable to the Twenty key in blast radius. Twenty's
key reads and writes CRM records; the Easypanel key can delete services, destroy
volumes, prune images, and reboot the host.

Two consequences:

- **Keep it in the environment, never in the app.** This app has no
  authentication and its Server Actions accept direct POSTs (see
  `twenty-integration.md`). An Easypanel token reachable from that surface would
  let anyone who can load the site delete the infrastructure.
- **Destructive calls deserve confirmation.** Restarts, prunes, volume deletion,
  and reboots are not reversible by re-running them.
