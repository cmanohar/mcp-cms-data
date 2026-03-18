/**
 * cms_medicare_enrollment — Search Medicare enrollment data by geography.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { cmsFetchJson } from "../lib/fetcher.js";
import { getDataset, buildDataApiUrl } from "../lib/datasets.js";
import { formatEnrollmentRecord } from "../lib/formatters.js";

export function registerMedicareEnrollment(server: McpServer): void {
  server.tool(
    "cms_medicare_enrollment",
    "Search Medicare monthly enrollment data by state, county, or nationally. Shows total enrollees, Original Medicare vs Medicare Advantage breakdown, and demographics (aged, disabled, ESRD).",
    {
      keyword: z
        .string()
        .describe(
          "Search term — matches state abbreviation, state name, county, or year. Example: 'CA 2024' or 'Los Angeles' or 'National 2023'",
        ),
      size: z.number().min(1).max(100).default(25).describe("Max results (default 25, max 100)"),
      offset: z.number().min(0).default(0).describe("Pagination offset (default 0)"),
    },
    async ({ keyword, size, offset }) => {
      const ds = getDataset("medicare-enrollment");
      const url = buildDataApiUrl(ds.id, { keyword, size, offset });
      const data = await cmsFetchJson<Record<string, string>[]>(url);

      const formatted = data.map(formatEnrollmentRecord);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { returned: formatted.length, offset, enrollment: formatted },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
