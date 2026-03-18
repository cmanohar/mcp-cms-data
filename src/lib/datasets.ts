/**
 * Dataset registry for CMS public data APIs.
 *
 * Two API families:
 * 1. data-api: GET https://data.cms.gov/data-api/v1/dataset/{id}/data?size=N&offset=N&keyword=...
 * 2. provider-data: POST https://data.cms.gov/provider-data/api/1/datastore/query/{id}/0
 * 3. medicaid-api: POST https://data.medicaid.gov/api/1/datastore/query/{id}
 *
 * Dataset UUIDs change with data refreshes — update here when CMS publishes new data.
 */

export type ApiFamily = "data-api" | "provider-data" | "medicaid-api";

export interface DatasetConfig {
  family: ApiFamily;
  id: string;
  description: string;
}

const DATASETS: Record<string, DatasetConfig> = {
  // Medicare Physician & Other Practitioners — By Provider and Service
  "physician-utilization": {
    family: "data-api",
    id: "31dc2c47-f297-4948-bfb4-075e1bec3a02",
    description: "Medicare physician utilization and payment by provider and HCPCS service",
  },

  // Medicare Part D Spending by Drug (annual)
  "drug-spending-d": {
    family: "data-api",
    id: "0ccf1b76-38e8-48c1-ad71-ab0eb69fb766",
    description: "Medicare Part D drug spending — brand/generic, total claims, beneficiaries, costs",
  },

  // Medicare Part B Spending by Drug (annual)
  "drug-spending-b": {
    family: "data-api",
    id: "76a714ad-3a2c-43ac-b76d-9dadf8f7d890",
    description: "Medicare Part B drug spending — physician-administered drugs",
  },

  // Hospital Provider Cost Report (HCRIS)
  "hospital-costs": {
    family: "data-api",
    id: "44060663-47d8-4ced-a115-b53b4c270acb",
    description: "Hospital cost reports — beds, discharges, revenue, costs",
  },

  // Hospital General Information (Care Compare)
  "hospital-quality": {
    family: "provider-data",
    id: "xubh-q36u",
    description: "Hospital general information — star ratings, ownership, services",
  },

  // Medicare Monthly Enrollment
  "medicare-enrollment": {
    family: "data-api",
    id: "d7fabe1e-d19b-4333-9eff-e80e0643f2fd",
    description: "Medicare monthly enrollment by state/county",
  },

  // NADAC Drug Pricing (on data.medicaid.gov)
  "nadac": {
    family: "medicaid-api",
    id: "ae004d7f-5799-5de3-91ec-f1247f1a5452",
    description: "National Average Drug Acquisition Cost (NADAC) — 2025",
  },
};

export function getDataset(name: string): DatasetConfig {
  const ds = DATASETS[name];
  if (!ds) {
    throw new Error(`Unknown dataset: ${name}. Available: ${Object.keys(DATASETS).join(", ")}`);
  }
  return ds;
}

export function getAllDatasets(): Record<string, DatasetConfig> {
  return { ...DATASETS };
}

// ── URL builders ──

const DATA_API_BASE = "https://data.cms.gov/data-api/v1/dataset";
const PROVIDER_DATA_BASE = "https://data.cms.gov/provider-data/api/1/datastore/query";
const MEDICAID_API_BASE = "https://data.medicaid.gov/api/1/datastore/query";

/**
 * Build a GET URL for data-api datasets.
 * Supports: size, offset, keyword (full-text search across all fields).
 */
export function buildDataApiUrl(
  datasetId: string,
  opts: { size?: number; offset?: number; keyword?: string },
): string {
  const params: string[] = [];
  if (opts.size !== undefined) params.push(`size=${opts.size}`);
  if (opts.offset !== undefined) params.push(`offset=${opts.offset}`);
  if (opts.keyword) params.push(`keyword=${encodeURIComponent(opts.keyword)}`);
  const qs = params.length > 0 ? `?${params.join("&")}` : "";
  return `${DATA_API_BASE}/${datasetId}/data${qs}`;
}

/**
 * Build URL + body for provider-data (POST) datasets.
 */
export function buildProviderDataUrl(datasetId: string): string {
  return `${PROVIDER_DATA_BASE}/${datasetId}/0`;
}

/**
 * Build URL for medicaid-api (POST) datasets.
 */
export function buildMedicaidApiUrl(datasetId: string): string {
  return `${MEDICAID_API_BASE}/${datasetId}`;
}
