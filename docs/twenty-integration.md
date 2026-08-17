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

## How leads map to Twenty

Twenty has **no built-in Lead object**. Workspaces model prospects either as
People, as Opportunities, or as a custom object. This integration maps the app's
`Lead` onto Twenty's standard **`people`** object.

| App field    | Twenty field                 |
| ------------ | ---------------------------- |
| `firstName`  | `name.firstName`             |
| `lastName`   | `name.lastName`              |
| `email`      | `emails.primaryEmail`        |
| `phone`      | `phones.primaryPhoneNumber`  |
| `company`    | `company.name` (via `depth=1`) |
| `jobTitle`   | `jobTitle`                   |
| `city`       | `city`                       |
| `status`     | `leadStatus` (custom field)  |
| `createdAt`  | `createdAt`                  |

All of this lives in `src/lib/twenty/leads.ts`. Nothing outside that file knows
Twenty's wire format, so adapting to a different schema means editing one module.

### Two assumptions worth checking

These are the likely causes if reads come back empty or writes return 400:

1. **Composite fields.** Current Twenty stores `name`, `emails`, and `phones` as
   composite objects (`name.firstName`). Older versions used flat scalars
   (`firstName`, `email`). The mapping assumes composite.
2. **`leadStatus` is a custom field.** There is no standard status field on
   Person. If your workspace does not define one, every lead reports `New` and
   status edits are silently dropped by Twenty. To add it: **Settings → Data
   model → Person → Add field**, type SELECT, name `leadStatus`, with options
   `New`, `Contacted`, `Qualified`, `Lost`. Or point `LEAD_STATUS_FIELD` in
   `leads.ts` at whatever field you already use.

Run the introspection script to confirm both against your actual workspace.

## Architecture

```
src/lib/twenty/
  config.ts       env vars; throws if unset rather than guessing a host
  client.ts       authenticated fetch + typed TwentyApiError   [server-only]
  lead-types.ts   types and constants safe to import in Client Components
  leads.ts        the Person <-> Lead mapping and CRUD         [server-only]

src/app/leads/
  page.tsx        Server Component; fetches and renders error states
  actions.ts      Server Actions for create / update / delete
  leads-view.tsx  Client Component; table, search, dialogs
```

`config.ts` and `client.ts` import `server-only`, so any accidental import from
a Client Component fails the build instead of leaking the API key into the
browser bundle.

Mutations call `updateTag(LEADS_CACHE_TAG)` rather than `revalidateTag`. Both
exist in Next.js 16, but `updateTag` gives read-your-writes semantics — the
table reflects an edit immediately instead of after a background revalidation.

## Security

The Twenty API key is a single shared workspace credential held server-side.
This app has no per-user authentication, and Server Actions are reachable by
direct POST, not only through the UI. Anyone who can reach a deployed instance
can read and write the CRM. Add an auth check in `src/app/leads/actions.ts`
before exposing this beyond a trusted network.
