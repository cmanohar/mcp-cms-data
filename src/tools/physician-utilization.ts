/**
 * cms_physician_utilization — Search Medicare physician utilization and payment data.
 *
 * Uses the data-api keyword search. The keyword parameter searches across all fields.
 * For precise filtering, combine NPI + HCPCS code.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { cmsFetchJson } from "../lib/fetcher.js";
import { getDataset, buildDataApiUrl } from "../lib/datasets.js";
import { formatPhysicianRecord } from "../lib/formatters.js";

export function registerPhysicianUtilization(server: McpServer): void {
  server.tool(
    "cms_physician_utilization",
    "Search Medicare physician utilization and payment data. Find how many services a provider billed, charges, and Medicare payments by NPI, provider name, HCPCS code, or specialty. Data covers Medicare Fee-for-Service Part B claims.",
    {
      keyword: z
        .string()
        .describe(
          "Search term — matches across all fields: provider name, NPI, HCPCS code, specialty, city, state. Example: '99213 Internal Medicine CA' or '1003000126'",
        ),
      size: z.number().min(1).max(100).default(20).describe("Max results (default 20, max 100)"),
      offset: z.number().min(0).default(0).describe("Pagination offset (default 0)"),
    },
    async ({ keyword, size, offset }) => {
      const ds = getDataset("physician-utilization");
      const url = buildDataApiUrl(ds.id, { keyword, size, offset });
      const data = await cmsFetchJson<Record<string, string>[]>(url);

      const formatted = data.map(formatPhysicianRecord);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                returned: formatted.length,
                offset,
                providers: formatted,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
