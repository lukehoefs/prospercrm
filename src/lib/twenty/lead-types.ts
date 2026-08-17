/**
 * Lead types and constants shared by server and client code.
 *
 * Deliberately free of imports and side effects so Client Components can use
 * it. Anything that touches the Twenty API — and therefore the API key —
 * belongs in `leads.ts`, which is server-only.
 */

/** Statuses the UI knows how to colour. Unknown values render neutrally. */
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number] | (string & {});

/** App-facing shape. Deliberately flat — the UI never sees Twenty's wire format. */
export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  /** Convenience: "First Last", or the email when both names are blank. */
  displayName: string;
  email: string;
  phone: string;
  company: string;
  companyId: string | null;
  jobTitle: string;
  city: string;
  status: LeadStatus;
  createdAt: string | null;
};

/** Fields the app writes. All optional so updates can be partial. */
export type LeadInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  city?: string;
  companyId?: string | null;
  status?: string;
};
