/**
 * cms_drug_spending — Search Medicare Part D drug spending data.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { cmsFetchJson } from "../lib/fetcher.js";
import { getDataset, buildDataApiUrl } from "../lib/datasets.js";
import { formatDrugSpendingRecord } from "../lib/formatters.js";

export function registerDrugSpending(server: McpServer): void {
  server.tool(
    "cms_drug_spending",
    "Search Medicare Part D drug spending data. Find total spending, claims, beneficiaries, and cost per unit for brand and generic drugs. Covers retail prescription drugs covered under Medicare Part D.",
    {
      drug_name: z.string().describe("Drug brand or generic name (e.g. Humira, adalimumab, Ozempic, semaglutide)"),
      part: z
        .enum(["D", "B"])
        .default("D")
        .describe("Medicare Part D (retail pharmacy) or Part B (physician-administered). Default: D"),
      size: z.number().min(1).max(50).default(10).describe("Max results (default 10, max 50)"),
    },
    async ({ drug_name, part, size }) => {
      const dsName = part === "B" ? "drug-spending-b" : "drug-spending-d";
      const ds = getDataset(dsName);
      const url = buildDataApiUrl(ds.id, { keyword: drug_name, size });
      const data = await cmsFetchJson<Record<string, string>[]>(url);

      const formatted = data.map(formatDrugSpendingRecord);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                part: `Part ${part}`,
                returned: formatted.length,
                drugs: formatted,
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
