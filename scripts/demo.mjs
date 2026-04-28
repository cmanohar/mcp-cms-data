import { cmsPostJson } from "../dist/lib/fetcher.js";
import { getDataset, buildMedicaidApiUrl } from "../dist/lib/datasets.js";

const ds = getDataset("nadac");
const url = buildMedicaidApiUrl(ds.id);

const body = {
  conditions: [{ resource: "t", property: "ndc_description", value: "%metformin%", operator: "LIKE" }],
  limit: 10,
  offset: 0,
  results: true,
  count: true,
};

const data = await cmsPostJson(url, body);
console.log(JSON.stringify(data, null, 2));
