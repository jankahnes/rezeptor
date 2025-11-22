import { SupabaseClient } from "@supabase/supabase-js";


async function getPercentile(supabase: SupabaseClient, table: string, column: string, value: number) {
    const { data, error } = await supabase
  .rpc('get_percentile', {
    p_table_name: table,
    p_column_name: column,
    p_value: value
  });

if (error) {
  throw new Error('Error calling calculate_percentile:', error);
}
return Math.round(data);
}

const percentileFields = ["hidx", "protein_score", "mnidx", "fat_profile_score", "sidx", "fiber_score", "salt_score", "sugar_score", "processing_level_score", "protective_score"]
const percentileFieldsFood = ["hidx", "protein_score", "mnidx", "fat_profile_score", "sidx", "fiber_score", "salt_score", "sugar_score", "nova", "protective_score"]
const icons = {
    0: POOR,
    10: BAD,
    25: SUBOPTIMAL,
    40: NEUTRAL,
    50: OKAY,
    60: GOOD,
    80: GREAT,
    90: EXCELLENT,
    95: OUTSTANDING,
}
    


export default async function fillReportPercentiles(supabase: SupabaseClient, report: any, isFood: boolean) {
  report.percentiles = {}
    for (const field of isFood ? percentileFieldsFood : percentileFields) {
        let percentile = await getPercentile(supabase, isFood ? 'foods' : 'recipes', field, report.overall[field])
        if(field == "nova") {
          percentile = 100 - percentile;
        }
        const item = getHighestThreshold(percentile, icons)
        const description = "Better than " + percentile + "% of " + (isFood ? "foods" : "recipes")
        report.percentiles[field] = { percentile: percentile,
            description: description,
            ...item
        }
    }
}