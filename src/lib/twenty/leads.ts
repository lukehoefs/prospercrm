import 'server-only';

import { TwentyApiError, twentyRequest } from './client';
import type { Lead, LeadInput, LeadStatus, LeadsPage, StatusFieldInfo } from './lead-types';

export type { Lead, LeadInput, LeadStatus, LeadsPage, StatusFieldInfo } from './lead-types';
export { LEAD_STATUSES } from './lead-types';

/**
 * Leads, backed by Twenty's `people` object.
 *
 * Twenty ships no Lead object. Person is used because it natively carries six
 * of the seven attributes a lead needs (name, email, phone, job title, city,
 * company) with the right types, and because People are what Twenty's message
 * participants, calendar participants, notes and tasks associate to. The one
 * thing Person lacks is a pipeline status, which is an additive custom field
 * rather than a reinterpretation of existing records.
 *
 * Two things about the workspace are discovered rather than assumed:
 *
 *   1. STATUS FIELD. There is no standard status field on Person, so this
 *      probes the metadata API once to learn whether the configured field
 *      exists and which options it offers. When it does not exist the app
 *      never writes it and never displays an invented value — a fabricated
 *      status is indistinguishable from a real one and drives duplicate work.
 *   2. FIELD SHAPE. Current Twenty stores `name`, `emails` and `phones` as
 *      composite objects; older versions used flat scalars. Reads accept both;
 *      writes try composite and retry flat, preserving the original error.
 *
 * Nothing outside this file knows Twenty's wire format.
 */

/** Custom SELECT field on Person holding the pipeline stage, if the workspace has one. */
const LEAD_STATUS_FIELD = process.env.TWENTY_LEAD_STATUS_FIELD?.trim() || 'leadStatus';

/** Which field shape this workspace accepts on writes; learned on first success. */
type FieldShape = 'composite' | 'flat';
let writeShape: FieldShape = 'composite';

/**
 * Raised when Twenty answers 2xx but the payload is not the shape this module
 * knows how to read. Distinct from "no records", which is a legitimate answer —
 * conflating the two turns a broken integration into a convincing empty state.
 */
export class TwentyEnvelopeError extends Error {
  readonly path: string;
  readonly received: string;

  constructor(path: string, received: string) {
    super(`Unrecognized response shape from ${path}. Received keys: ${received}`);
    this.name = 'TwentyEnvelopeError';
    this.path = path;
    this.received = received;
  }
}

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
  [key: string]: unknown;
};

type MetadataField = { name?: string; type?: string; options?: Array<{ value?: string }> | null };
type MetadataObject = {
  nameSingular?: string;
  namePlural?: string;
  fields?: MetadataField[] | { edges?: Array<{ node?: MetadataField }> } | null;
};

// --- Status field discovery -------------------------------------------------

const STATUS_UNAVAILABLE: StatusFieldInfo = {
  available: false,
  name: LEAD_STATUS_FIELD,
  options: [],
};

/** Cached across the process; shared so concurrent renders make one probe. */
let statusFieldProbe: Promise<StatusFieldInfo> | null = null;

function fieldsOf(object: MetadataObject): MetadataField[] {
  const fields = object.fields;
  if (Array.isArray(fields)) return fields;
  if (fields && Array.isArray(fields.edges)) {
    return fields.edges.map((edge) => edge?.node).filter((node): node is MetadataField => Boolean(node));
  }
  return [];
}

/**
 * Asks the workspace whether the status field exists.
 *
 * Any failure — the metadata endpoint being unavailable, the key lacking
 * permission, an unexpected payload — resolves to "unavailable" rather than
 * rejecting. That is the safe direction: the app then reads and writes leads
 * without status instead of failing outright on a question that is optional.
 */
export function getStatusField(): Promise<StatusFieldInfo> {
  if (!statusFieldProbe) {
    statusFieldProbe = (async () => {
      try {
        const response = await twentyRequest<{ data?: { objects?: MetadataObject[] } | MetadataObject[] }>(
          '/rest/metadata/objects',
          { query: { limit: 100 } },
        );

        const raw = response?.data;
        const objects: MetadataObject[] = Array.isArray(raw) ? raw : (raw?.objects ?? []);
        const person = objects.find(
          (object) => object.nameSingular === 'person' || object.namePlural === 'people',
        );
        if (!person) return STATUS_UNAVAILABLE;

        const field = fieldsOf(person).find((candidate) => candidate.name === LEAD_STATUS_FIELD);
        if (!field) return STATUS_UNAVAILABLE;

        const options = (field.options ?? [])
          .map((option) => option?.value)
          .filter((value): value is string => Boolean(value));

        return { available: true, name: LEAD_STATUS_FIELD, options };
      } catch {
        return STATUS_UNAVAILABLE;
      }
    })();
  }
  return statusFieldProbe;
}

// --- Mapping ----------------------------------------------------------------

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Returns null rather than a placeholder when the record carries no status. */
function readStatus(person: TwentyPerson, statusField: StatusFieldInfo): LeadStatus | null {
  if (!statusField.available) return null;

  const raw = person[LEAD_STATUS_FIELD];
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  // Twenty returns SELECT fields as an object in some versions.
  if (raw && typeof raw === 'object' && 'value' in raw) {
    const value = clean((raw as { value?: unknown }).value);
    if (value) return value;
  }
  return null;
}

function toLead(person: TwentyPerson, statusField: StatusFieldInfo): Lead {
  // Composite first, then the flat equivalent.
  const firstName = clean(person.name?.firstName) || clean(person.firstName);
  const lastName = clean(person.name?.lastName) || clean(person.lastName);
  const email = clean(person.emails?.primaryEmail) || clean(person.email);
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  return {
    id: person.id,
    firstName,
    lastName,
    displayName: fullName || email || 'Unnamed lead',
    email,
    // Kept apart so writing `phone` back cannot duplicate the calling code.
    phone: clean(person.phones?.primaryPhoneNumber) || clean(person.phone),
    phoneCallingCode: clean(person.phones?.primaryPhoneCallingCode),
    company: clean(person.company?.name),
    companyId: person.companyId ?? person.company?.id ?? null,
    jobTitle: clean(person.jobTitle),
    city: clean(person.city),
    status: readStatus(person, statusField),
    createdAt: person.createdAt ?? null,
  };
}

/**
 * Builds a request body in the given shape.
 *
 * `includeStatus` is false unless the workspace is known to have the field.
 * Sending an unknown field is either rejected outright or silently dropped,
 * and both outcomes are worse than not offering status at all.
 */
function toPersonBody(
  input: LeadInput,
  shape: FieldShape,
  includeStatus: boolean,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.firstName !== undefined || input.lastName !== undefined) {
    if (shape === 'composite') {
      // Twenty stores name as one composite value; both halves travel together.
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
    // Only the number: the calling code stays as Twenty holds it.
    if (shape === 'composite') body.phones = { primaryPhoneNumber: input.phone };
    else body.phone = input.phone;
  }

  if (input.jobTitle !== undefined) body.jobTitle = input.jobTitle;
  if (input.city !== undefined) body.city = input.city;
  if (input.companyId !== undefined) body.companyId = input.companyId;
  if (includeStatus && input.status !== undefined) body[LEAD_STATUS_FIELD] = input.status;

  return body;
}

/**
 * Writes using the remembered field shape, retrying once in the other shape.
 *
 * If the retry also fails, the ORIGINAL error is what propagates. The retry is
 * a speculative guess about field naming; its error describes fields the caller
 * never mentioned and would send an operator chasing the wrong problem.
 */
async function writePerson(
  path: string,
  method: 'POST' | 'PATCH',
  input: LeadInput,
  includeStatus: boolean,
): Promise<Record<string, unknown> | undefined> {
  try {
    return await twentyRequest(path, {
      method,
      body: toPersonBody(input, writeShape, includeStatus),
    });
  } catch (error) {
    if (!(error instanceof TwentyApiError) || error.status !== 400) throw error;

    const fallback: FieldShape = writeShape === 'composite' ? 'flat' : 'composite';
    let response: Record<string, unknown> | undefined;
    try {
      response = await twentyRequest(path, {
        method,
        body: toPersonBody(input, fallback, includeStatus),
      });
    } catch {
      // The guess was wrong too. Report what the real attempt said.
      throw error;
    }

    writeShape = fallback;
    return response;
  }
}

/** Pulls the person out of whichever envelope key this Twenty version uses. */
function personFromWrite(response: unknown): TwentyPerson | null {
  const data = (response as { data?: Record<string, unknown> } | undefined)?.data;
  if (!data || typeof data !== 'object') return null;

  for (const value of Object.values(data)) {
    if (value && typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
      return value as TwentyPerson;
    }
  }
  return null;
}

// --- Operations -------------------------------------------------------------

export const LEADS_CACHE_TAG = 'twenty-leads';

/**
 * Fetches leads, newest first. `depth: 1` pulls the related company in the
 * same round trip so the table can show a company name without an N+1.
 *
 * Requests one more than the cap so truncation can be reported honestly rather
 * than presenting a capped count as the workspace total.
 */
export async function listLeads(limit = 60): Promise<LeadsPage> {
  const statusField = await getStatusField();

  const path = '/rest/people';
  const response = await twentyRequest<{ data?: { people?: TwentyPerson[] } | TwentyPerson[] }>(path, {
    query: { limit: limit + 1, depth: 1, order_by: 'createdAt[DescNullsLast]' },
    next: { tags: [LEADS_CACHE_TAG] },
  });

  const raw = response?.data;
  const people = Array.isArray(raw) ? raw : raw?.people;

  if (!Array.isArray(people)) {
    // A 2xx with an unreadable payload is a broken integration, not an empty
    // workspace. Saying so beats rendering a convincing "no leads yet".
    const keys = raw && typeof raw === 'object' ? Object.keys(raw).join(', ') : typeof raw;
    throw new TwentyEnvelopeError(path, keys || '(none)');
  }

  const truncated = people.length > limit;
  return {
    leads: people.slice(0, limit).map((person) => toLead(person, statusField)),
    statusField,
    limit,
    truncated,
  };
}

export async function createLead(input: LeadInput): Promise<Lead | null> {
  const statusField = await getStatusField();
  const response = await writePerson('/rest/people', 'POST', input, statusField.available);

  const created = personFromWrite(response);
  return created ? toLead(created, statusField) : null;
}

export async function updateLead(id: string, input: LeadInput): Promise<Lead | null> {
  const statusField = await getStatusField();
  const response = await writePerson(`/rest/people/${id}`, 'PATCH', input, statusField.available);

  const updated = personFromWrite(response);
  return updated ? toLead(updated, statusField) : null;
}

export async function deleteLead(id: string): Promise<void> {
  await twentyRequest(`/rest/people/${id}`, { method: 'DELETE' });
}
