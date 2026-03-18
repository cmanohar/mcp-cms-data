/**
 * Rate-limited HTTP fetcher for CMS data APIs.
 *
 * Supports both GET (data-api) and POST (provider-data, medicaid-api) patterns.
 * No API key required — all CMS data is public.
 */

const USER_AGENT = "mcp-cms-data/0.1.0 (MCP server for CMS public data)";

// Token bucket: 10 req/s (conservative)
const RATE = 10;
let tokens = RATE;
let lastRefill = Date.now();

function refillTokens(): void {
  const now = Date.now();
  const elapsed = now - lastRefill;
  if (elapsed > 0) {
    tokens = Math.min(RATE, tokens + (elapsed / 1000) * RATE);
    lastRefill = now;
  }
}

async function waitForToken(): Promise<void> {
  refillTokens();
  if (tokens >= 1) {
    tokens -= 1;
    return;
  }
  const waitMs = ((1 - tokens) / RATE) * 1000;
  await new Promise((resolve) => setTimeout(resolve, Math.ceil(waitMs)));
  refillTokens();
  tokens -= 1;
}

/**
 * Rate-limited GET request.
 */
export async function cmsGet(url: string): Promise<Response> {
  await waitForToken();
  return fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
}

/**
 * Rate-limited POST request.
 */
export async function cmsPost(url: string, body: object): Promise<Response> {
  await waitForToken();
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

/**
 * GET JSON from data-api, with retry on 429.
 * Returns the parsed JSON array.
 */
export async function cmsFetchJson<T = unknown>(url: string): Promise<T> {
  let res = await cmsGet(url);

  if (res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    res = await cmsGet(url);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`CMS API error: ${res.status} ${res.statusText} — ${url}\n${body}`);
  }

  return (await res.json()) as T;
}

/**
 * POST JSON to provider-data or medicaid-api, with retry on 429.
 * Returns { count, results }.
 */
export async function cmsPostJson<T = unknown>(
  url: string,
  body: object,
): Promise<T> {
  let res = await cmsPost(url, body);

  if (res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    res = await cmsPost(url, body);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`CMS API error: ${res.status} ${res.statusText} — POST ${url}\n${text}`);
  }

  return (await res.json()) as T;
}
