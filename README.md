# mcp-cms-data

MCP server for CMS public data — physician utilization, drug spending, hospital quality, hospital costs, drug pricing (NADAC), and Medicare enrollment. No API key required.

## What is this?

This server gives any MCP-compatible AI client direct access to six CMS and Medicaid public datasets. All data is fetched live from official government APIs at query time — no local database, no API key, no cost.

## Tools

| Tool | Description |
|------|-------------|
| `cms_physician_utilization` | Medicare Part B claims — services billed, charges, and payments by provider, NPI, HCPCS code, or specialty |
| `cms_drug_spending` | Medicare Part D and Part B drug spending — total spend, claims, beneficiaries, and cost per unit |
| `cms_hospital_quality` | CMS Care Compare — hospital star ratings, quality measures, and national benchmark comparisons |
| `cms_hospital_costs` | Medicare cost reports (HCRIS) — beds, discharges, revenue, total costs, and cost-to-charge ratio |
| `cms_drug_pricing` | NADAC — actual drug acquisition costs used by state Medicaid programs, updated weekly |
| `cms_medicare_enrollment` | Monthly Medicare enrollment by geography — Original Medicare vs Medicare Advantage, demographics |

## Prerequisites

- Node.js >= 18
- No API key — all data is public

## Installation

```bash
git clone https://github.com/cmanohar/mcp-cms-data.git
cd mcp-cms-data
npm install
npm run build
```

The compiled server will be at `dist/index.js`.

## Adding to an MCP Client

This server uses stdio transport. Any MCP-compatible client (Claude Desktop, Claude Code, Cursor, etc.) accepts the same configuration shape:

```json
{
  "mcpServers": {
    "cms-data": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-cms-data/dist/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/mcp-cms-data` with the actual path where you cloned the repo.

**Claude Desktop** — add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows), then restart Claude.

**Claude Code** — add to `.mcp.json` in your project root, or run:
```bash
claude mcp add cms-data node /absolute/path/to/mcp-cms-data/dist/index.js
```

---

## Tool Reference

### `cms_physician_utilization`

Search Medicare Fee-for-Service Part B claims data. Find how many services a provider billed, what they charged, and what Medicare paid — by provider name, NPI, HCPCS procedure code, specialty, or location.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | **yes** | Search term across all fields: name, NPI, HCPCS code, specialty, city, state. e.g. `"99213 Internal Medicine CA"` |
| `size` | number | no | Max results; default 20, max 100 |
| `offset` | number | no | Pagination offset; default 0 |

**Example queries**
- *"How many E&M visits did Dr. Patel bill to Medicare in California?"*
- *"What did orthopedic surgeons charge for HCPCS code 27447 (knee replacement)?"*
- *"Find all Medicare claims for NPI 1003000126"*

---

### `cms_drug_spending`

Search Medicare drug spending data. Covers Part D (retail pharmacy) and Part B (physician-administered drugs). Returns total spending, claims, beneficiaries, and cost per unit.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drug_name` | string | **yes** | Brand or generic name. e.g. `"Humira"`, `"adalimumab"`, `"Ozempic"` |
| `part` | `"D"` \| `"B"` | no | Medicare Part D (pharmacy) or Part B (provider-administered); default `"D"` |
| `size` | number | no | Max results; default 10, max 50 |

**Example queries**
- *"How much did Medicare spend on Ozempic last year?"*
- *"What's the total Part B spending on Keytruda?"*
- *"Compare Medicare spending on brand vs generic adalimumab"*

---

### `cms_hospital_quality`

Search CMS Care Compare hospital quality data. Returns star ratings (1–5), ownership type, emergency services, and comparisons to national benchmarks across six quality dimensions: mortality, readmission, safety, patient experience, care effectiveness, and timeliness.

At least one search parameter is required.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `hospital_name` | string | no | Hospital name or partial name |
| `state` | string | no | Two-letter state code (e.g. `CA`, `NY`) |
| `overall_rating` | number | no | CMS star rating 1–5 |
| `hospital_type` | string | no | e.g. `"Acute Care Hospitals"`, `"Critical Access Hospitals"` |
| `limit` | number | no | Max results; default 10, max 50 |

**Example queries**
- *"Which 5-star hospitals are in Massachusetts?"*
- *"How does Mass General score on readmission and safety?"*
- *"Find Critical Access Hospitals in rural states with high patient experience ratings"*

---

### `cms_hospital_costs`

Search Medicare cost report data (HCRIS). Returns hospital financial data: total beds, discharges, net patient revenue, total costs, net income, and cost-to-charge ratio from annual Medicare cost reports.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | **yes** | Search across hospital name, CCN, state, city. e.g. `"Cedars-Sinai"`, `"CA"`, `"050001"` |
| `size` | number | no | Max results; default 10, max 50 |
| `offset` | number | no | Pagination offset; default 0 |

**Example queries**
- *"What are the total costs and net income for Mayo Clinic?"*
- *"Find hospitals in Texas with cost-to-charge ratios below 0.3"*
- *"How many beds and discharges does NYU Langone report?"*

---

### `cms_drug_pricing`

Search NADAC (National Average Drug Acquisition Cost) data — the actual prices pharmacies pay to acquire drugs. Used by state Medicaid programs for reimbursement. Updated weekly.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drug_name` | string | **yes** | Brand or generic name. e.g. `"metformin"`, `"Jardiance"`, `"lisinopril"` |
| `ndc` | string | no | 11-digit National Drug Code for an exact lookup; overrides `drug_name` |
| `limit` | number | no | Max results; default 10, max 50 |

**Example queries**
- *"What's the current acquisition cost for metformin 500mg?"*
- *"Look up NADAC pricing for NDC 00093-7193-98"*
- *"Compare Jardiance pricing across pack sizes"*

---

### `cms_medicare_enrollment`

Search monthly Medicare enrollment data by geography. Returns total enrollees, Original Medicare vs Medicare Advantage breakdown, and demographics (aged, disabled, ESRD) at national, state, or county level.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | **yes** | State abbreviation, state name, county, or year. e.g. `"CA 2024"`, `"Los Angeles"`, `"National 2023"` |
| `size` | number | no | Max results; default 25, max 100 |
| `offset` | number | no | Pagination offset; default 0 |

**Example queries**
- *"How many Medicare beneficiaries are enrolled in California as of 2024?"*
- *"What share of Los Angeles County enrollees are in Medicare Advantage?"*
- *"Show national Medicare enrollment trends from 2020 to 2024"*

---

## Data Sources

| Tool | Source | Update Frequency |
|------|--------|-----------------|
| `cms_physician_utilization` | CMS Medicare Part B claims (data.cms.gov) | Annual |
| `cms_drug_spending` (Part D) | CMS Medicare Part D spending (data.cms.gov) | Annual |
| `cms_drug_spending` (Part B) | CMS Medicare Part B drug spending (data.cms.gov) | Annual |
| `cms_hospital_quality` | CMS Care Compare (data.cms.gov/provider-data) | Quarterly |
| `cms_hospital_costs` | HCRIS cost reports (data.cms.gov) | Annual |
| `cms_drug_pricing` | NADAC (data.medicaid.gov) | Weekly |
| `cms_medicare_enrollment` | CMS enrollment data (data.cms.gov) | Monthly |

All data is public and requires no authentication.

**Dataset IDs:** CMS assigns UUIDs to each dataset that may change when new annual data is published. If a tool stops returning results, check `src/lib/datasets.ts` and update the ID to the current distribution.

## Development

```bash
npm run build      # Compile TypeScript → dist/
npm run dev        # Watch mode (recompiles on change)
npm test           # Run tests with Vitest
npm run test:watch # Watch mode for tests
npm start          # Run the compiled server
```

## License

MIT — Chinmay Manohar
