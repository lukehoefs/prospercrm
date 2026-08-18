# Twenty CRM integration

The Leads page is backed by a self-hosted [Twenty](https://twenty.com) workspace.

## Setup

1. In Twenty: **Settings → APIs & Webhooks → Create API key**. The value is shown
   once, at creation.
2. Copy `.env.example` to `.env.local` and fill in both values:

   ```
   TWENTY_BASE_URL=https://your-instance.example.com
   TWENTY_API_KEY=eyJhbGciOi...
   ```

3. Restart the dev server. `.env.local` is gitignored; the key must never be
   committed, and must never be given a `NEXT_PUBLIC_` prefix — it grants full
   read/write access to the workspace.

Verify the connection and dump the workspace schema:

```bash
npm run twenty:introspect          # readable summary
npm run twenty:introspect -- --json  # full JSON
```

The script reads schema metadata only. It fetches no records and writes nothing.

## Why leads map to Person

Twenty ships **no Lead object**. The three candidates were Person, Opportunity,
and a custom object. Person wins on field fit and blast radius:

- Person natively carries six of the seven attributes a lead needs — `name`,
  `emails`, `phones`, `jobTitle`, `city`, `companyId` — with the right types. It
  is missing exactly one: pipeline status, which is an *additive* custom field
  that changes nothing about existing records.
- Opportunity carries one of the seven and structurally cannot hold email, phone,
  job title, or city. Using it would mean several denormalized custom fields
  duplicating the same human, plus editing the standard stage enum
  (`NEW`/`SCREENING`/`MEETING`/`PROPOSAL`/`CUSTOMER`, which has no "Lost") —
  rewriting the meaning of every existing opportunity, saved view, and kanban.
- A custom `leads` object would forfeit message participants, calendar
  participants, timeline activities, and note/task targets, all of which
  associate to People only.

Accepted costs: leads live in the shared People list, and deleting a lead deletes
a Person along with everything linked to them.

| App field    | Twenty field                    |
| ------------ | ------------------------------- |
| `firstName`  | `name.firstName`                |
| `lastName`   | `name.lastName`                 |
| `email`      | `emails.primaryEmail`           |
| `phone`      | `phones.primaryPhoneNumber`     |
| *(display)*  | `phones.primaryPhoneCallingCode` |
| `company`    | `company.name` (via `depth=1`)  |
| `jobTitle`   | `jobTitle`                      |
| `city`       | `city`                          |
| `status`     | a custom SELECT field, if present |
| `createdAt`  | `createdAt`                     |

All of it lives in `src/lib/twenty/leads.ts`. Nothing outside that file knows
Twenty's wire format.

## Status is discovered, not assumed

Twenty has no standard status field on Person, so whether one exists is a
property of *your workspace*. On first use the app probes
`/rest/metadata/objects` once per process and caches the answer:

- **Field present** — its SELECT options drive the dropdown, and status reads
  and writes normally.
- **Field absent** — the app shows a one-time notice explaining how to add it,
  hides the status control, renders status as `—`, and **never sends the field**.

That last part matters. Writing a field the workspace does not have is either
rejected outright or silently discarded, so the app must know before it writes.
Equally, a record with no status renders as `—` and never as an invented "New":
a fabricated status is indistinguishable from a real one and drives duplicate
outreach.

To enable status: **Settings → Data model → Person → Add field**, type SELECT,
options `New`, `Contacted`, `Qualified`, `Lost`. Name it `leadStatus`, or name it
anything and point `TWENTY_LEAD_STATUS_FIELD` at it.

## Field shape

Current Twenty stores `name`, `emails`, and `phones` as composite objects
(`name.firstName`); older versions used flat scalars (`firstName`, `email`).
Reads accept either. Writes try composite and retry flat once; if the retry also
fails, the **original** error propagates, because the retry's error describes
fields the caller never mentioned and would send you chasing the wrong problem.

Once the target instance is confirmed composite, delete the dual-shape path
outright rather than keeping a guess in the write path.

Two related notes: `name` is written as a unit, so a partial update must supply
both halves or the missing one is blanked; and `phone` carries the national
number only, with the calling code left as Twenty holds it — joining them on
read and writing the joined string back would duplicate the prefix on every
edit.

## Architecture

```
src/lib/twenty/
  config.ts       env vars; throws if unset rather than guessing a host
  client.ts       authenticated fetch + typed TwentyApiError   [server-only]
  lead-types.ts   types and constants safe to import in Client Components
  leads.ts        status probe, Person <-> Lead mapping, CRUD  [server-only]

src/app/leads/
  page.tsx        Server Component; fetches and renders error states
  actions.ts      Server Actions for create / update / delete
  leads-view.tsx  Client Component; table, search, dialogs
```

`config.ts` and `client.ts` import `server-only`, so any accidental import from
a Client Component fails the build instead of leaking the API key into the
browser bundle.

Mutations call `refresh()` from `next/cache`. `updateTag` was used originally,
but `/leads` is `force-dynamic` and therefore uncached — tags only attach to
cached data, so there was no entry for the tag to expire and the call did
nothing.

## Failure modes worth knowing

- **A 2xx with an unreadable payload** raises `TwentyEnvelopeError` rather than
  degrading to an empty list. A broken integration that renders "No leads yet"
  is indistinguishable from an empty workspace, which is the worst outcome.
- **A write that returns no record** reports as unconfirmed rather than success.
  The dialog stays open and says so.
- **A 2xx that isn't JSON** is reported as a wrong `TWENTY_BASE_URL`, not as a
  Twenty error — it usually means the URL points at a login page or front-end.
- **A proxy refusing the request** is distinguished from a rejected key. They
  look alike (both 403) and have completely different remedies.
- **The list is capped** at 60 by default. The UI says "Newest 60 of more
  than 60" when there are more, because search filters only the fetched page.

## Security

The Twenty API key is a single shared workspace credential held server-side.
This app has no per-user authentication, and Server Actions are reachable by
direct POST, not only through the UI. Anyone who can reach a deployed instance
can read and write the CRM. Add an auth check in `src/app/leads/actions.ts`
before exposing this beyond a trusted network.
