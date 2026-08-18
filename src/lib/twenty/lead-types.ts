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

/**
 * What the workspace supports for lead status.
 *
 * Twenty has no standard status field on Person, so whether one exists is a
 * property of the workspace, not of this app. `available: false` means the
 * field is genuinely absent (or could not be confirmed) — the UI must then
 * neither display a status nor try to write one.
 */
export type StatusFieldInfo = {
  available: boolean;
  /** The field name looked for, so the UI can name it in a hint. */
  name: string;
  /** SELECT options as defined in the workspace; empty when unavailable. */
  options: string[];
};

/** App-facing shape. Deliberately flat — the UI never sees Twenty's wire format. */
export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  /** Convenience: "First Last", or the email when both names are blank. */
  displayName: string;
  email: string;
  /**
   * The national number only, i.e. what a person edits. The calling code is
   * kept separate so writing this value back cannot duplicate the prefix.
   */
  phone: string;
  /** Calling code as stored by Twenty, e.g. "+1". Display only. */
  phoneCallingCode: string;
  company: string;
  companyId: string | null;
  jobTitle: string;
  city: string;
  /**
   * null means "this workspace does not track status", or the record has none.
   * Never invent a value here — a fabricated "New" is indistinguishable from a
   * real one and drives duplicate outreach.
   */
  status: LeadStatus | null;
  createdAt: string | null;
};

/** Fields the app writes. All optional so updates can be partial. */
export type LeadInput = {
  /**
   * Twenty stores `name` as one composite value, so first and last are written
   * as a unit: supplying only one blanks the other. Callers doing a partial
   * update must pass both halves.
   */
  firstName?: string;
  lastName?: string;
  email?: string;
  /** National number only; the calling code is left as Twenty holds it. */
  phone?: string;
  jobTitle?: string;
  city?: string;
  companyId?: string | null;
  /** Ignored unless the workspace actually has the status field. */
  status?: string;
};

/** What `listLeads` returns, including the honesty bits the UI needs. */
export type LeadsPage = {
  leads: Lead[];
  statusField: StatusFieldInfo;
  /** The cap applied to this read. */
  limit: number;
  /** True when the workspace holds more leads than were fetched. */
  truncated: boolean;
};
