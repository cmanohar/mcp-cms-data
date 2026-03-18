/**
 * Formatters for CMS data API responses.
 * Maps verbose CMS field names to clean, LLM-friendly keys.
 */

// ── Physician Utilization ──

export function formatPhysicianRecord(r: Record<string, string>): Record<string, unknown> {
  return {
    npi: r.Rndrng_NPI || null,
    provider_name: [r.Rndrng_Prvdr_Last_Org_Name, r.Rndrng_Prvdr_First_Name]
      .filter(Boolean)
      .join(", "),
    credentials: r.Rndrng_Prvdr_Crdntls || null,
    specialty: r.Rndrng_Prvdr_Type || null,
    city: r.Rndrng_Prvdr_City || null,
    state: r.Rndrng_Prvdr_State_Abrvtn || null,
    hcpcs_code: r.HCPCS_Cd || null,
    hcpcs_description: r.HCPCS_Desc || null,
    total_beneficiaries: parseInt(r.Tot_Benes) || 0,
    total_services: parseInt(r.Tot_Srvcs) || 0,
    avg_submitted_charge: parseFloat(r.Avg_Sbmtd_Chrg) || 0,
    avg_medicare_allowed: parseFloat(r.Avg_Mdcr_Alowd_Amt) || 0,
    avg_medicare_payment: parseFloat(r.Avg_Mdcr_Pymt_Amt) || 0,
  };
}

// ── Drug Spending (Part D) ──

export function formatDrugSpendingRecord(r: Record<string, string>): Record<string, unknown> {
  // Fields include multi-year columns like Tot_Spndng_2019, Tot_Spndng_2020, etc.
  // Find the most recent year's data
  const years = Object.keys(r)
    .filter((k) => k.startsWith("Tot_Spndng_"))
    .map((k) => k.replace("Tot_Spndng_", ""))
    .sort()
    .reverse();

  const latestYear = years[0] || "";
  const suffix = latestYear ? `_${latestYear}` : "";

  return {
    brand_name: r.Brnd_Name || null,
    generic_name: r.Gnrc_Name || null,
    manufacturer: r.Mftr_Name || null,
    total_manufacturers: parseInt(r.Tot_Mftr) || 0,
    year: latestYear || null,
    total_spending: parseFloat(r[`Tot_Spndng${suffix}`]) || 0,
    total_dosage_units: parseFloat(r[`Tot_Dsg_Unts${suffix}`]) || 0,
    total_claims: parseInt(r[`Tot_Clms${suffix}`]) || 0,
    total_beneficiaries: parseInt(r[`Tot_Benes${suffix}`]) || 0,
    avg_spending_per_unit: parseFloat(r[`Avg_Spnd_Per_Dsg_Unt_Wghtd${suffix}`]) || 0,
    avg_spending_per_claim: parseFloat(r[`Avg_Spnd_Per_Clm${suffix}`]) || 0,
    avg_spending_per_beneficiary: parseFloat(r[`Avg_Spnd_Per_Bene${suffix}`]) || 0,
  };
}

// ── Hospital Quality (Care Compare) ──

export function formatHospitalQualityRecord(r: Record<string, string>): Record<string, unknown> {
  return {
    facility_id: r.facility_id || null,
    facility_name: r.facility_name || null,
    address: r.address || null,
    city: r.citytown || null,
    state: r.state || null,
    zip: r.zip_code || null,
    phone: r.telephone_number || null,
    hospital_type: r.hospital_type || null,
    ownership: r.hospital_ownership || null,
    overall_rating: r.hospital_overall_rating ? parseInt(r.hospital_overall_rating) : null,
    emergency_services: r.emergency_services === "Yes",
    mortality_comparison: r.mortality_national_comparison || null,
    readmission_comparison: r.readmission_national_comparison || null,
    safety_comparison: r.safety_of_care_national_comparison || null,
    patient_experience_comparison: r.patient_experience_national_comparison || null,
    effectiveness_comparison: r.effectiveness_of_care_national_comparison || null,
    timeliness_comparison: r.timeliness_of_care_national_comparison || null,
  };
}

// ── Hospital Cost Reports ──

export function formatHospitalCostRecord(r: Record<string, string>): Record<string, unknown> {
  return {
    provider_ccn: r["Provider CCN"] || null,
    hospital_name: r["Hospital Name"] || null,
    city: r.City || null,
    state: r["State Code"] || null,
    zip: r["Zip Code"] || null,
    rural_urban: r["Rural Versus Urban"] || null,
    total_beds: parseInt(r["Number of Beds"]) || null,
    total_discharges: parseInt(r["Total Discharges"]) || null,
    total_days: parseInt(r["Total Days"]) || null,
    net_patient_revenue: parseFloat(r["Net Patient Revenue"]) || null,
    total_costs: parseFloat(r["Total Costs"]) || null,
    net_income: parseFloat(r["Net Income"]) || null,
    cost_to_charge_ratio: parseFloat(r["Cost to Charge Ratio"]) || null,
    fiscal_year_begin: r["Fiscal Year Begin Date"] || null,
    fiscal_year_end: r["Fiscal Year End Date"] || null,
  };
}

// ── NADAC Drug Pricing ──

export function formatNadacRecord(r: Record<string, string>): Record<string, unknown> {
  return {
    ndc: r.ndc || r.NDC || null,
    drug_name: r.ndc_description || r.NDC_Description || null,
    nadac_per_unit: parseFloat(r.nadac_per_unit || r.NADAC_Per_Unit || "0") || 0,
    pricing_unit: r.pricing_unit || r.Pricing_Unit || null,
    effective_date: r.effective_date || r.Effective_Date || null,
    pharmacy_type: r.pharmacy_type_indicator || r.Pharmacy_Type_Indicator || null,
    otc: r.otc || r.OTC || null,
    classification: r.classification_for_rate_setting || r.Classification_for_Rate_Setting || null,
    explanation_code: r.explanation_code || r.Explanation_Code || null,
    as_of_date: r.as_of_date || r.As_of_Date || null,
  };
}

// ── Medicare Enrollment ──

export function formatEnrollmentRecord(r: Record<string, string>): Record<string, unknown> {
  return {
    year: r.YEAR || null,
    month: r.MONTH || null,
    geo_level: r.BENE_GEO_LVL || null,
    state: r.BENE_STATE_ABRVTN || null,
    state_name: r.BENE_STATE_DESC || null,
    county: r.BENE_COUNTY_DESC || null,
    fips: r.BENE_FIPS_CD || null,
    total_enrollees: parseInt(r.TOT_BENES) || 0,
    original_medicare: parseInt(r.ORGNL_MDCR_BENES) || 0,
    medicare_advantage: parseInt(r.MA_AND_OTH_BENES) || 0,
    aged_enrollees: parseInt(r.AGED_TOT_BENES) || null,
    disabled_enrollees: parseInt(r.DSBLD_TOT_BENES) || null,
    esrd_enrollees: parseInt(r.ESRD_TOT_BENES) || null,
    a_b_enrollees: parseInt(r.A_B_TOT_BENES) || null,
  };
}
