/**
 * Runs one sample query per tool, mirroring the README examples.
 * Usage: node scripts/demo-all.mjs
 */

import { cmsFetchJson, cmsPostJson } from "../dist/lib/fetcher.js";
import {
  getDataset,
  buildDataApiUrl,
  buildProviderDataUrl,
  buildMedicaidApiUrl,
} from "../dist/lib/datasets.js";
import {
  formatPhysicianRecord,
  formatDrugSpendingRecord,
  formatHospitalQualityRecord,
  formatHospitalCostRecord,
  formatNadacRecord,
  formatEnrollmentRecord,
} from "../dist/lib/formatters.js";

function section(title) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log("=".repeat(60));
}

// 1. cms_physician_utilization — "What did orthopedic surgeons charge for HCPCS 27447?"
section("1. cms_physician_utilization — HCPCS 27447 (knee replacement)");
{
  const ds = getDataset("physician-utilization");
  const url = buildDataApiUrl(ds.id, { keyword: "27447", size: 5 });
  const data = await cmsFetchJson(url);
  const results = data.map(formatPhysicianRecord);
  console.log(JSON.stringify({ returned: results.length, providers: results }, null, 2));
}

// 2. cms_drug_spending — "How much did Medicare spend on Ozempic last year?"
section("2. cms_drug_spending — Ozempic (Part D)");
{
  const ds = getDataset("drug-spending-d");
  const url = buildDataApiUrl(ds.id, { keyword: "Ozempic", size: 5 });
  const data = await cmsFetchJson(url);
  const results = data.map(formatDrugSpendingRecord);
  console.log(JSON.stringify({ part: "Part D", returned: results.length, drugs: results }, null, 2));
}

// 3. cms_hospital_quality — "Which 5-star hospitals are in Massachusetts?"
section("3. cms_hospital_quality — 5-star hospitals in MA");
{
  const ds = getDataset("hospital-quality");
  const url = buildProviderDataUrl(ds.id);
  const body = {
    conditions: [
      { resource: "t", property: "state", value: "MA", operator: "=" },
      { resource: "t", property: "hospital_overall_rating", value: "5", operator: "=" },
    ],
    limit: 5,
    offset: 0,
  };
  const data = await cmsPostJson(url, body);
  const results = data.results.map(formatHospitalQualityRecord);
  console.log(JSON.stringify({ total_results: data.count, returned: results.length, hospitals: results }, null, 2));
}

// 4. cms_hospital_costs — "What are the total costs and net income for Mayo Clinic?"
section("4. cms_hospital_costs — Mayo Clinic");
{
  const ds = getDataset("hospital-costs");
  const url = buildDataApiUrl(ds.id, { keyword: "Mayo Clinic", size: 5 });
  const data = await cmsFetchJson(url);
  const results = data.map(formatHospitalCostRecord);
  console.log(JSON.stringify({ returned: results.length, facilities: results }, null, 2));
}

// 5. cms_drug_pricing — "What's the current acquisition cost for metformin 500mg?"
section("5. cms_drug_pricing — metformin (NADAC)");
{
  const ds = getDataset("nadac");
  const url = buildMedicaidApiUrl(ds.id);
  const body = {
    conditions: [{ resource: "t", property: "ndc_description", value: "%METFORMIN HCL 500%", operator: "LIKE" }],
    sorts: [{ property: "effective_date", order: "desc" }],
    limit: 5,
    offset: 0,
  };
  const data = await cmsPostJson(url, body);
  const results = data.results.map(formatNadacRecord);
  console.log(JSON.stringify({ total_results: data.count, returned: results.length, drugs: results }, null, 2));
}

// 6. cms_medicare_enrollment — "How many Medicare beneficiaries are enrolled in California as of 2024?"
section("6. cms_medicare_enrollment — CA 2024");
{
  const ds = getDataset("medicare-enrollment");
  const url = buildDataApiUrl(ds.id, { keyword: "CA 2024", size: 5 });
  const data = await cmsFetchJson(url);
  const results = data.map(formatEnrollmentRecord);
  console.log(JSON.stringify({ returned: results.length, enrollment: results }, null, 2));
}

console.log(`\n${"=".repeat(60)}`);
console.log("  All 6 queries complete.");
console.log("=".repeat(60) + "\n");
