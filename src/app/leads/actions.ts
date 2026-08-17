'use server';

import { updateTag } from 'next/cache';

import { TwentyApiError } from '@/lib/twenty/client';
import { TwentyConfigError } from '@/lib/twenty/config';
import { createLead, deleteLead, updateLead, LEADS_CACHE_TAG } from '@/lib/twenty/leads';
import type { LeadInput } from '@/lib/twenty/leads';

/**
 * Server Actions for lead mutations.
 *
 * These are reachable by direct POST, not only through the UI. There is no
 * user-facing auth in this app yet — the Twenty API key is a single shared
 * workspace credential held server-side — so anyone who can reach the app can
 * write to the CRM. Add an auth check here before exposing this beyond the
 * local network.
 */

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

/** Turns transport failures into something a person can act on. */
function toMessage(error: unknown): string {
  if (error instanceof TwentyConfigError) {
    return 'Twenty is not configured. Set TWENTY_BASE_URL and TWENTY_API_KEY in .env.local.';
  }
  if (error instanceof TwentyApiError) {
    if (error.isAuthError) {
      return 'Twenty rejected the API key. Generate a new one in Settings → APIs & Webhooks.';
    }
    if (error.status === 400) {
      return `Twenty rejected the data: ${error.body.slice(0, 200)}`;
    }
    return `Twenty returned ${error.status}. ${error.body.slice(0, 200)}`;
  }
  if (error instanceof TypeError) {
    // fetch throws TypeError when the host is unreachable.
    return 'Could not reach the Twenty instance. Check TWENTY_BASE_URL and that the server is up.';
  }
  return 'Something went wrong talking to Twenty.';
}

function validate(input: LeadInput): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!input.firstName && !input.lastName && !input.email) {
    fieldErrors.firstName = 'Enter a name or an email address.';
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    fieldErrors.email = 'That does not look like an email address.';
  }

  return fieldErrors;
}

function readForm(formData: FormData): LeadInput {
  return {
    firstName: text(formData, 'firstName'),
    lastName: text(formData, 'lastName'),
    email: text(formData, 'email'),
    phone: text(formData, 'phone'),
    jobTitle: text(formData, 'jobTitle'),
    city: text(formData, 'city'),
    status: text(formData, 'status') || undefined,
  };
}

export async function createLeadAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const input = readForm(formData);

  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors };
  }

  try {
    await createLead(input);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  // Expire and refetch in the same request so the new lead is visible
  // immediately rather than after a background revalidation.
  updateTag(LEADS_CACHE_TAG);
  return { ok: true };
}

export async function updateLeadAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = text(formData, 'id');
  if (!id) return { ok: false, error: 'Missing lead id.' };

  const input = readForm(formData);

  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors };
  }

  try {
    await updateLead(id, input);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  updateTag(LEADS_CACHE_TAG);
  return { ok: true };
}

export async function deleteLeadAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const id = text(formData, 'id');
  if (!id) return { ok: false, error: 'Missing lead id.' };

  try {
    await deleteLead(id);
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  updateTag(LEADS_CACHE_TAG);
  return { ok: true };
}
