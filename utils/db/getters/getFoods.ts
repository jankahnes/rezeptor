import type { SupabaseClient } from '@supabase/supabase-js';
import { expectSingle } from '~/utils/db/getters/expectSingle';
import buildQuery from '~/utils/db/getters/buildQuery';
import type { GetterOpts } from '~/types/exports';

//TODO all of this can be removed once satiety is filled in DB 
function scale_by_points(value: number, points: [number, number][]) {
  if (value <= points[0][0]) {
    return points[0][1];
  }
  if (value >= points[points.length - 1][0]) {
    return points[points.length - 1][1];
  }
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i][0];
    const y1 = points[i][1];
    const x2 = points[i + 1][0];
    const y2 = points[i + 1][1];
    if (x1 <= value && value <= x2) {
      return y1 + ((value - x1) * (y2 - y1)) / (x2 - x1);
    }
  }
  return 0;
}


function getED(kcal: number) {
  return scale_by_points(kcal, [
    [0, 100],
    [50, 90],
    [150, 70],
    [200, 50],
    [350, 30],
    [550, 0],
  ]);
}


export async function getFoods(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  let query = client.from('foods').select(`*`);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  const foods = data as Food[];
  for (const food of foods) {
    if (!food.satiety) {
      food.satiety = 0.5 * getED(food.kcal ?? 0) + 0.5 * (food.sidx ?? 0);
    }
  }
  return foods;
}

export async function getFood(client: SupabaseClient, opts: GetterOpts = {}) {
  return expectSingle(await getFoods(client, opts));
}

export async function getFoodNames(client: SupabaseClient, opts: GetterOpts = {}) {
  let query = client.from('food_names').select(`
    *,
    food:foods(*)
  `);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getFoodName(client: SupabaseClient, opts: GetterOpts = {}) {
  return expectSingle(await getFoodNames(client, opts));
}