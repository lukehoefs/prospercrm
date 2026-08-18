import 'server-only';

import { TwentyApiError, twentyRequest } from './client';
import type { Lead, LeadInput, LeadStatus } from './lead-types';

export type { Lead, LeadInput, LeadStatus } from './lead-types';
export { LEAD_STATUSES } from './lead-types';

/**
 * Leads, backed by Twenty's `people` object.
 *
 * Twenty has no built-in "Lead" object. This module maps the app's Lead to a
 * Twenty Person, which is how most workspaces track prospects before they
 * become opportunities.
 *
 * Two things vary between Twenty versions and between workspaces, so rather
 * than assuming either, this module adapts:
 *
 *   1. FIELD SHAPE. Current Twenty stores `name`, `emails`, and `phones` as
 *      composite objects (`name.firstName`); older versions used flat scalars
 *      (`firstName`, `email`). Reads accept both. Writes try composite first
 *      and fall back to flat if the instance rejects it, remembering which
 *      shape worked so the fallback costs one request per process, not one
 *      per write.
 *   2. STATUS FIELD. There is no standard status field on Person. This reads
 *      whichever custom field TWENTY_LEAD_STATUS_FIELD names, defaulting to
 *      `leadStatus`. When the field does not exist, leads report a fallback
 *      status — that is a missing field, not an error.
 *
 * Nothing outside this file knows Twenty's wire format.
 */

/** Custom SELECT field on Person holding the pipeline stage, if present. */
const LEAD_STATUS_FIELD = process.env.TWENTY_LEAD_STATUS_FIELD?.trim() || 'leadStatus';

const FALLBACK_STATUS = 'New';

/** Which field shape this workspace accepts on writes; learned on first failure. */
type FieldShape = 'composite' | 'flat';
let writeShape: FieldShape = 'composite';

// --- Wire types -------------------------------------------------------------

type TwentyPerson = {
  id: string;
  // Composite shape (current Twenty).
  name?: { firstName?: string | null; lastName?: string | null } | null;
  emails?: { primaryEmail?: string | null } | null;
  phones?: { primaryPhoneNumber?: string | null; primaryPhoneCallingCode?: string | null } | null;
  // Flat shape (older Twenty).
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
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

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readStatus(person: TwentyPerson): LeadStatus {
  const raw = person[LEAD_STATUS_FIELD];
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  // Twenty returns SELECT fields as an object in some versions.
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const value = clean((raw as { value?: unknown }).value);
    if (value) return value;
  }
  return FALLBACK_STATUS;
}

function toLead(person: TwentyPerson): Lead {
  // Composite first, then the flat equivalent.
  const firstName = clean(person.name?.firstName) || clean(person.firstName);
  const lastName = clean(person.name?.lastName) || clean(person.lastName);
  const email = clean(person.emails?.primaryEmail) || clean(person.email);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  const callingCode = clean(person.phones?.primaryPhoneCallingCode);
  const number = clean(person.phones?.primaryPhoneNumber) || clean(person.phone);

  return {
    id: person.id,
    firstName,
    lastName,
    displayName: fullName || email || 'Unnamed lead',
    email,
    phone: [callingCode, number].filter(Boolean).join(' '),
    company: clean(person.company?.name),
    companyId: person.companyId ?? person.company?.id ?? null,
    jobTitle: clean(person.jobTitle),
    city: clean(person.city),
    status: readStatus(person),
    createdAt: person.createdAt ?? null,
  };
}

/** Builds a request body in the given shape, omitting undefined fields. */
function toPersonBody(input: LeadInput, shape: FieldShape): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.firstName !== undefined || input.lastName !== undefined) {
    if (shape === 'composite') {
      body.name = { firstName: input.firstName ?? '', lastName: input.lastName ?? '' };
    } else {
      if (input.firstName !== undefined) body.firstName = input.firstName;
      if (input.lastName !== undefined) body.lastName = input.lastName;
    }
  }
  if (input.email !== undefined) {
    if (shape === 'composite') body.emails = { primaryEmail: input.email };
    else body.email = input.email;
  }
  if (input.phone !== undefined) {
    if (shape === 'composite') body.phones = { primaryPhoneNumber: input.phone };
    else body.phone = input.phone;
  }

  if (input.jobTitle !== undefined) body.jobTitle = input.jobTitle;
  if (input.city !== undefined) body.city = input.city;
  if (input.companyId !== undefined) body.companyId = input.companyId;
  if (input.status !== undefined) body[LEAD_STATUS_FIELD] = input.status;

  return body;
}

/**
 * Writes using the remembered field shape, retrying once in the other shape
 * if the instance rejects the body. A 400 here means "this workspace does not
 * have those fields", which is exactly the version difference we adapt to;
 * any other status is a real failure and propagates untouched.
 */
async function writePerson(
  path: string,
  method: 'POST' | 'PATCH',
  input: LeadInput,
): Promise<SingleResponse> {
  try {
    return await twentyRequest<SingleResponse>(path, {
      method,
      body: toPersonBody(input, writeShape),
    });
  } catch (error) {
    if (!(error instanceof TwentyApiError) || error.status !== 400) throw error;

    const fallback: FieldShape = writeShape === 'composite' ? 'flat' : 'composite';
    const response = await twentyRequest<SingleResponse>(path, {
      method,
      body: toPersonBody(input, fallback),
    });

    // Only remember the fallback once it has actually succeeded.
    writeShape = fallback;
    return response;
  }
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
  const response = await writePerson('/rest/people', 'POST', input);
  const created = response?.data?.createPerson;
  return created ? toLead(created) : null;
}

export async function updateLead(id: string, input: LeadInput): Promise<Lead | null> {
  const response = await writePerson(`/rest/people/${id}`, 'PATCH', input);
  const updated = response?.data?.updatePerson;
  return updated ? toLead(updated) : null;
}

export async function deleteLead(id: string): Promise<void> {
  await twentyRequest(`/rest/people/${id}`, { method: 'DELETE' });
}
