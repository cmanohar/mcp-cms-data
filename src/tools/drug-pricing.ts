/**
 * cms_drug_pricing — Search NADAC drug acquisition cost data.
 *
 * NADAC is hosted on data.medicaid.gov (not data.cms.gov).
 * Uses the DKAN POST API — same pattern as Open Payments.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { cmsPostJson } from "../lib/fetcher.js";
import { getDataset, buildMedicaidApiUrl } from "../lib/datasets.js";
import { formatNadacRecord } from "../lib/formatters.js";

interface DkanCondition {
  resource: string;
  property: string;
  value: string;
  operator: "=" | "LIKE" | ">=" | "<=";
}

interface DkanResponse {
  count: number;
  results: Record<string, string>[];
}

export function registerDrugPricing(server: McpServer): void {
  server.tool(
    "cms_drug_pricing",
    "Search NADAC (National Average Drug Acquisition Cost) data. Find drug acquisition costs used by state Medicaid programs. Updated weekly with actual pharmacy acquisition costs from surveys.",
    {
      drug_name: z.string().describe("Drug name to search (brand or generic, e.g. metformin, Jardiance, lisinopril)"),
      ndc: z.string().optional().describe("National Drug Code (11-digit NDC) for exact lookup"),
      limit: z.number().min(1).max(50).default(10).describe("Max results (default 10, max 50)"),
    },
    async ({ drug_name, ndc, limit }) => {
      const ds = getDataset("nadac");
      const url = buildMedicaidApiUrl(ds.id);

      const conditions: DkanCondition[] = [];

      if (ndc) {
        conditions.push({ resource: "t", property: "ndc", value: ndc, operator: "=" });
      } else {
        conditions.push({
          resource: "t",
          property: "ndc_description",
          value: `%${drug_name}%`,
          operator: "LIKE",
        });
      }

      const body = {
        conditions,
        sorts: [{ property: "effective_date", order: "desc" }],
        limit,
        offset: 0,
      };

      const data = await cmsPostJson<DkanResponse>(url, body);
      const formatted = data.results.map(formatNadacRecord);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { total_results: data.count, returned: formatted.length, drugs: formatted },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
