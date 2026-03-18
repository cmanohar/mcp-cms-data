/**
 * cms_hospital_quality — Search hospital quality data (Care Compare).
 *
 * Uses the provider-data POST API (different from data-api GET).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { cmsPostJson } from "../lib/fetcher.js";
import { getDataset, buildProviderDataUrl } from "../lib/datasets.js";
import { formatHospitalQualityRecord } from "../lib/formatters.js";

interface ProviderDataCondition {
  resource: string;
  property: string;
  value: string;
  operator: "=" | "LIKE" | ">=" | "<=";
}

interface ProviderDataResponse {
  count: number;
  results: Record<string, string>[];
}

export function registerHospitalQuality(server: McpServer): void {
  server.tool(
    "cms_hospital_quality",
    "Search CMS hospital quality data (Care Compare). Find hospital star ratings, quality measures, ownership, and comparison to national benchmarks. Covers all Medicare-certified hospitals.",
    {
      hospital_name: z.string().optional().describe("Hospital name or partial name"),
      state: z.string().optional().describe("Two-letter state abbreviation (e.g. CA, NY)"),
      overall_rating: z
        .number()
        .min(1)
        .max(5)
        .optional()
        .describe("Filter by CMS overall star rating (1-5)"),
      hospital_type: z
        .string()
        .optional()
        .describe("Hospital type (e.g. Acute Care Hospitals, Critical Access Hospitals)"),
      limit: z.number().min(1).max(50).default(10).describe("Max results (default 10, max 50)"),
    },
    async ({ hospital_name, state, overall_rating, hospital_type, limit }) => {
      const ds = getDataset("hospital-quality");
      const url = buildProviderDataUrl(ds.id);

      const conditions: ProviderDataCondition[] = [];

      if (hospital_name) {
        conditions.push({
          resource: "t",
          property: "facility_name",
          value: `%${hospital_name}%`,
          operator: "LIKE",
        });
      }
      if (state) {
        conditions.push({
          resource: "t",
          property: "state",
          value: state,
          operator: "=",
        });
      }
      if (overall_rating !== undefined) {
        conditions.push({
          resource: "t",
          property: "hospital_overall_rating",
          value: String(overall_rating),
          operator: "=",
        });
      }
      if (hospital_type) {
        conditions.push({
          resource: "t",
          property: "hospital_type",
          value: `%${hospital_type}%`,
          operator: "LIKE",
        });
      }

      if (conditions.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { error: "Provide at least one search parameter (hospital_name, state, overall_rating, or hospital_type)" },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      const body = { conditions, limit, offset: 0 };
      const data = await cmsPostJson<ProviderDataResponse>(url, body);

      const formatted = data.results.map(formatHospitalQualityRecord);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { total_results: data.count, returned: formatted.length, hospitals: formatted },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
