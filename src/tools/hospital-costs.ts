/**
 * cms_hospital_costs — Search hospital cost report data (HCRIS).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { cmsFetchJson } from "../lib/fetcher.js";
import { getDataset, buildDataApiUrl } from "../lib/datasets.js";
import { formatHospitalCostRecord } from "../lib/formatters.js";

export function registerHospitalCosts(server: McpServer): void {
  server.tool(
    "cms_hospital_costs",
    "Search Medicare hospital cost report data (HCRIS). Find hospital financial data including beds, discharges, revenue, costs, and cost-to-charge ratios from annual Medicare cost reports.",
    {
      keyword: z
        .string()
        .describe(
          "Search term — matches hospital name, CCN, state, city. Example: 'Cedars-Sinai' or 'CA' or '050001'",
        ),
      size: z.number().min(1).max(50).default(10).describe("Max results (default 10, max 50)"),
      offset: z.number().min(0).default(0).describe("Pagination offset (default 0)"),
    },
    async ({ keyword, size, offset }) => {
      const ds = getDataset("hospital-costs");
      const url = buildDataApiUrl(ds.id, { keyword, size, offset });
      const data = await cmsFetchJson<Record<string, string>[]>(url);

      const formatted = data.map(formatHospitalCostRecord);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { returned: formatted.length, offset, facilities: formatted },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
