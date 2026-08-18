import 'server-only';

import { getTwentyConfig } from './config';

/**
 * Thin wrapper over the Twenty REST API.
 *
 * Twenty exposes two REST surfaces on a self-hosted instance:
 *   - `{baseUrl}/rest/*`          — record CRUD (people, companies, ...)
 *   - `{baseUrl}/rest/metadata/*` — workspace schema (objects and their fields)
 *
 * Both authenticate with the same workspace API key as a Bearer token.
 */

export class TwentyApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: string;
  /** The response succeeded but was not JSON — see `looksLikeWrongBaseUrl`. */
  readonly nonJson: boolean;

  constructor(status: number, path: string, body: string, nonJson = false) {
    super(`Twenty API ${status} on ${path}: ${truncate(body, 500)}`);
    this.name = 'TwentyApiError';
    this.status = status;
    this.path = path;
    this.body = body;
    this.nonJson = nonJson;
  }

  /**
   * A 2xx that isn't JSON means the base URL is pointed at something other
   * than the Twenty API — a login page, a reverse proxy, or the front-end.
   * Reporting the status alone produces "Twenty returned 200", which reads as
   * a Twenty fault rather than a configuration mistake.
   */
  get looksLikeWrongBaseUrl(): boolean {
    return this.nonJson;
  }

  /**
   * A proxy between this server and Twenty refused to forward the request,
   * so it never reached the instance. Distinguished from a rejected key
   * because the remedy is completely different — and because reporting this
   * as "bad credentials" sends people off rotating a key that was never sent.
   */
  get isBlockedUpstream(): boolean {
    return this.status === 403 && /not in allowlist|egress|proxy/i.test(this.body);
  }

  /** The key is missing, revoked, or belongs to another workspace. */
  get isAuthError(): boolean {
    if (this.isBlockedUpstream) return false;
    return this.status === 401 || this.status === 403;
  }
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Query string parameters; undefined values are dropped. */
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  /** Next.js fetch cache options. Mutations should stay uncached. */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
};

/**
 * Performs an authenticated request against the Twenty API and returns the
 * parsed JSON body.
 *
 * `path` is relative to the instance root and must start with a slash,
 * e.g. `/rest/people` or `/rest/metadata/objects`.
 */
export async function twentyRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { baseUrl, apiKey } = getTwentyConfig();
  const { method = 'GET', query, body, next, cache } = options;

  const url = new URL(`${baseUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    // Mutations must never be served from cache.
    cache: cache ?? (method === 'GET' ? undefined : 'no-store'),
    next: method === 'GET' ? next : undefined,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new TwentyApiError(response.status, path, text);
  }

  // DELETE and some PATCH responses can be empty.
  if (!text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new TwentyApiError(
      response.status,
      path,
      `Expected JSON, received: ${truncate(text, 200)}`,
      true,
    );
  }
}
