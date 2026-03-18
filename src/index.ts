#!/usr/bin/env node

/**
 * mcp-cms-data — MCP server for CMS public healthcare data.
 *
 * Wraps data.cms.gov and data.medicaid.gov APIs to search:
 * - Physician utilization & payments (Medicare Part B)
 * - Drug spending (Parts B & D)
 * - Hospital quality measures (Care Compare)
 * - Hospital cost reports (HCRIS)
 * - Drug acquisition costs (NADAC)
 * - Medicare enrollment by geography
 *
 * No API key required — all data is public.
 *
 * Usage:
 *   node dist/index.js   # stdio transport
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerPhysicianUtilization } from "./tools/physician-utilization.js";
import { registerDrugSpending } from "./tools/drug-spending.js";
import { registerHospitalQuality } from "./tools/hospital-quality.js";
import { registerHospitalCosts } from "./tools/hospital-costs.js";
import { registerDrugPricing } from "./tools/drug-pricing.js";
import { registerMedicareEnrollment } from "./tools/medicare-enrollment.js";

const server = new McpServer({
  name: "mcp-cms-data",
  version: "0.1.0",
});

// Register all 6 tools
registerPhysicianUtilization(server);
registerDrugSpending(server);
registerHospitalQuality(server);
registerHospitalCosts(server);
registerDrugPricing(server);
registerMedicareEnrollment(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-cms-data server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
