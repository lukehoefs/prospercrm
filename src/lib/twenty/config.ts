/**
 * Twenty CRM connection config.
 *
 * Both values are server-only. Never expose them via NEXT_PUBLIC_* — the API
 * key grants full read/write access to the workspace.
 */

export type TwentyConfig = {
  /** Base URL of the self-hosted Twenty instance, no trailing slash. */
  baseUrl: string;
  /** Workspace API key (Settings → APIs & Webhooks in Twenty). */
  apiKey: string;
};

export class TwentyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TwentyConfigError';
  }
}

/**
 * Reads config from the environment. Throws rather than falling back to a
 * default host, so a missing key fails loudly at the call site instead of
 * sending credentials somewhere unintended.
 */
export function getTwentyConfig(): TwentyConfig {
  const baseUrl = process.env.TWENTY_BASE_URL?.trim();
  const apiKey = process.env.TWENTY_API_KEY?.trim();

  if (!baseUrl) {
    throw new TwentyConfigError(
      'TWENTY_BASE_URL is not set. Add it to .env.local (e.g. https://crm.example.com).',
    );
  }
  if (!apiKey) {
    throw new TwentyConfigError(
      'TWENTY_API_KEY is not set. Add it to .env.local.',
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

/** True when both env vars are present, for rendering a "not configured" state. */
export function isTwentyConfigured(): boolean {
  return Boolean(process.env.TWENTY_BASE_URL?.trim() && process.env.TWENTY_API_KEY?.trim());
}
