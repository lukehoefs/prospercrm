import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TwentyApiError } from '@/lib/twenty/client';
import { TwentyConfigError } from '@/lib/twenty/config';
import { listLeads, type Lead } from '@/lib/twenty/leads';

import { LeadsView } from './leads-view';

/** Leads are live CRM data — never statically prerendered. */
export const dynamic = 'force-dynamic';

type LoadResult =
  | { ok: true; leads: Lead[] }
  | { ok: false; title: string; detail: string; hint?: string };

async function loadLeads(): Promise<LoadResult> {
  try {
    return { ok: true, leads: await listLeads() };
  } catch (error) {
    if (error instanceof TwentyConfigError) {
      return {
        ok: false,
        title: 'Twenty is not configured',
        detail: error.message,
        hint: 'Copy .env.example to .env.local and fill in both values, then restart the dev server.',
      };
    }

    if (error instanceof TwentyApiError) {
      if (error.isAuthError) {
        return {
          ok: false,
          title: 'Twenty rejected the API key',
          detail: `The instance returned ${error.status}.`,
          hint: 'Generate a fresh key in Twenty under Settings → APIs & Webhooks and update TWENTY_API_KEY.',
        };
      }
      if (error.status === 404) {
        return {
          ok: false,
          title: 'Twenty endpoint not found',
          detail: `${error.status} on ${error.path}.`,
          hint: 'Check that TWENTY_BASE_URL points at the Twenty server root, without a trailing path.',
        };
      }
      return {
        ok: false,
        title: 'Twenty returned an error',
        detail: `${error.status} on ${error.path}. ${error.body.slice(0, 300)}`,
      };
    }

    // fetch throws TypeError when DNS fails, the host refuses, or egress is blocked.
    return {
      ok: false,
      title: 'Could not reach Twenty',
      detail: error instanceof Error ? error.message : 'Unknown network error.',
      hint: 'Confirm the instance is running and that this server is allowed to reach TWENTY_BASE_URL.',
    };
  }
}

export default async function LeadsPage() {
  const result = await loadLeads();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-slate-500 mt-2">Manage your prospective customers here.</p>
        </div>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-amber-900">{result.title}</CardTitle>
            <CardDescription className="text-amber-800">{result.detail}</CardDescription>
          </CardHeader>
          {result.hint ? (
            <CardContent>
              <p className="text-sm text-amber-800">{result.hint}</p>
            </CardContent>
          ) : null}
        </Card>
      </div>
    );
  }

  return <LeadsView leads={result.leads} />;
}
