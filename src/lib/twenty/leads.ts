import 'server-only';

import { twentyRequest } from './client';
import type { Lead, LeadInput, LeadStatus } from './lead-types';

export type { Lead, LeadInput, LeadStatus } from './lead-types';
export { LEAD_STATUSES } from './lead-types';

/**
 * Leads, backed by Twenty's `people` object.
 *
 * ---------------------------------------------------------------------------
 * SCHEMA ASSUMPTIONS — see docs/twenty-integration.md
 * ---------------------------------------------------------------------------
 * Twenty has no built-in "Lead" object. This module maps the app's Lead to a
 * Twenty Person, which is how most workspaces track prospects before they
 * become opportunities.
 *
 * Two details vary by Twenty version and by workspace, and are the likely
 * cause if reads come back empty or writes 400:
 *
 *   1. `name`, `emails`, and `phones` are COMPOSITE fields in current Twenty
 *      (`name.firstName`, `emails.primaryEmail`). Older versions used flat
 *      scalars (`firstName`, `email`).
 *   2. Lead status has no standard field. `LEAD_STATUS_FIELD` below names the
 *      custom SELECT field this app reads; when the field is absent every lead
 *      simply reports the fallback status, which is not an error.
 *
 * Run `npm run twenty:introspect` against the workspace to confirm both, and
 * adjust the mapping in this file — nothing outside it depends on the wire
 * shape.
 */

/** Custom SELECT field on Person holding the pipeline stage, if present. */
const LEAD_STATUS_FIELD = 'leadStatus';

const FALLBACK_STATUS = 'New';

// --- Wire types -------------------------------------------------------------

type TwentyPerson = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  emails?: { primaryEmail?: string | null } | null;
  phones?: { primaryPhoneNumber?: string | null; primaryPhoneCallingCode?: string | null } | null;
  jobTitle?: string | null;
  city?: string | null;
  companyId?: string | null;
  company?: { id?: string | null; name?: string | null } | null;
  createdAt?: string | null;
  // Custom fields are returned alongside the standard ones.
  [key: string]: unknown;
};

type ListResponse = { data?: { people?: TwentyPerson[] } | null };
type SingleResponse = { data?: { createPerson?: TwentyPerson; updatePerson?: TwentyPerson } | null };

// --- Mapping ----------------------------------------------------------------

function readStatus(person: TwentyPerson): LeadStatus {
  const raw = person[LEAD_STATUS_FIELD];
  if (typeof raw === 'string' && raw.trim()) return raw;
  return FALLBACK_STATUS;
}

function toLead(person: TwentyPerson): Lead {
  const firstName = person.name?.firstName?.trim() ?? '';
  const lastName = person.name?.lastName?.trim() ?? '';
  const email = person.emails?.primaryEmail?.trim() ?? '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const callingCode = person.phones?.primaryPhoneCallingCode?.trim() ?? '';
  const number = person.phones?.primaryPhoneNumber?.trim() ?? '';

  return {
    id: person.id,
    firstName,
    lastName,
    displayName: fullName || email || 'Unnamed lead',
    email,
    phone: [callingCode, number].filter(Boolean).join(' '),
    company: person.company?.name?.trim() ?? '',
    companyId: person.companyId ?? person.company?.id ?? null,
    jobTitle: person.jobTitle?.trim() ?? '',
    city: person.city?.trim() ?? '',
    status: readStatus(person),
    createdAt: person.createdAt ?? null,
  };
}

/** Builds a Twenty request body, omitting fields the caller left undefined. */
function toPersonBody(input: LeadInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.firstName !== undefined || input.lastName !== undefined) {
    body.name = {
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
    };
  }
  if (input.email !== undefined) {
    body.emails = { primaryEmail: input.email };
  }
  if (input.phone !== undefined) {
    body.phones = { primaryPhoneNumber: input.phone };
  }
  if (input.jobTitle !== undefined) body.jobTitle = input.jobTitle;
  if (input.city !== undefined) body.city = input.city;
  if (input.companyId !== undefined) body.companyId = input.companyId;
  if (input.status !== undefined) body[LEAD_STATUS_FIELD] = input.status;

  return body;
}

// --- Operations -------------------------------------------------------------

export const LEADS_CACHE_TAG = 'twenty-leads';

/**
 * Fetches leads, newest first. `depth: 1` pulls the related company in the
 * same round trip so the table can show a company name without an N+1.
 */
export async function listLeads(limit = 60): Promise<Lead[]> {
  const response = await twentyRequest<ListResponse>('/rest/people', {
    query: { limit, depth: 1, order_by: 'createdAt[DescNullsLast]' },
    next: { tags: [LEADS_CACHE_TAG] },
  });

  return (response?.data?.people ?? []).map(toLead);
}

export async function createLead(input: LeadInput): Promise<Lead | null> {
  const response = await twentyRequest<SingleResponse>('/rest/people', {
    method: 'POST',
    body: toPersonBody(input),
  });

  const created = response?.data?.createPerson;
  return created ? toLead(created) : null;
}

export async function updateLead(id: string, input: LeadInput): Promise<Lead | null> {
  const response = await twentyRequest<SingleResponse>(`/rest/people/${id}`, {
    method: 'PATCH',
    body: toPersonBody(input),
  });

  const updated = response?.data?.updatePerson;
  return updated ? toLead(updated) : null;
}

export async function deleteLead(id: string): Promise<void> {
  await twentyRequest(`/rest/people/${id}`, { method: 'DELETE' });
}
