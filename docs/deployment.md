# Deployment (Vercel)

The app is deployed from this repository to Vercel.

| | |
| --- | --- |
| Team | Prosper MFG (`team_9jVVOzXE47LzEHQTUrDYWXM1`) |
| Project | `prospercrm` (`prj_AN8HMrumAjpcsZADr0aAqX0TnH68`) |
| Git | `lukehoefs/prospercrm`, auto-deploys on push |
| Production branch | `main` |

## Why Vercel, and not the sandbox

The Leads page needs to reach the Twenty instance at
`1-twenty.k9pirj.easypanel.host`. Claude Code web sessions cannot: their egress
proxy denies CONNECT to that host, so the request never leaves the container.
Vercel's builders and functions have no such restriction, so a deployed instance
can talk to Twenty even while local verification cannot. Deploying is currently
the only way to exercise the integration end to end.

## Required environment variables

Set these in **Vercel → prospercrm → Settings → Environment Variables**, for
Production and Preview. There is no API for this in the tooling used here, so it
is a manual step.

| Variable | Value |
| --- | --- |
| `TWENTY_BASE_URL` | `https://1-twenty.k9pirj.easypanel.host` |
| `TWENTY_API_KEY` | Workspace API key (Twenty → Settings → APIs & Webhooks) |
| `TWENTY_LEAD_STATUS_FIELD` | Optional; only if the status field is not named `leadStatus` |

Neither may carry a `NEXT_PUBLIC_` prefix — the key grants full read/write to
the workspace and must stay server-side.

Until they are set, the build still succeeds and every page renders except
`/leads`, which reports "Twenty is not configured". That is by design:
`getTwentyConfig()` throws rather than guessing a host.

## Access protection

The app has **no authentication of its own**, and its Server Actions accept
direct POSTs rather than only UI traffic. Anyone who can load the deployment can
read and write the CRM. Vercel Authentication is therefore enabled, scoped to
`prod_deployment_urls_and_all_previews`, so only Prosper MFG team members can
reach any deployment.

**This has a gap worth knowing.** That scope covers deployment URLs and
previews. It does **not** cover production domains, and this team's plan cannot
protect them — `all` is rejected with `invalid_sso_protection`. Attaching a
custom domain would therefore publish an unauthenticated CRM to the internet.

The project has three aliases, and they are not equally covered:

| Alias | Kind |
| --- | --- |
| `prospercrm-ioz6qx7m9-prosper-mfg.vercel.app` | deployment URL — protected |
| `prospercrm-git-claude-twenty-crm-connection-fq5961-prosper-mfg.vercel.app` | branch/preview — protected |
| `prospercrm-pearl.vercel.app` | production domain — **verify before trusting** |
| `prospercrm-prosper-mfg.vercel.app` | production domain — **verify before trusting** |

Whether Vercel treats an auto-assigned production `.vercel.app` alias as a
"production deployment URL" (protected) or a "production domain" (not) was not
determined here, and it cannot be tested from a Claude Code session because
`vercel.app` is itself denied by the egress proxy. Guessing is not acceptable
for a writable CRM, so **check it directly**: open
`https://prospercrm-pearl.vercel.app` in a private window while logged out of
Vercel. A login wall means protected. The app itself means it is public.

Until that check passes, do not set `TWENTY_API_KEY`. Without it `/leads` reports
"Twenty is not configured" and there is nothing to leak; with it, an unprotected
alias is a writable CRM open to the internet.

Do not attach a custom domain until the app has real authentication. When it
does, add the auth check in `src/app/leads/actions.ts`, since Server Actions are
the reachable write surface.

## Branches

`main` is the production branch, but the Twenty integration is not on it yet —
it lives on `claude/twenty-crm-connection-fq5961` (PRs #2 and #3) until merged.
Pushes to that branch deploy as protected previews, which is where the
integration can be exercised in the meantime.
