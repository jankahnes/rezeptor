import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export default function buildQueryFromRecipeFiltering(
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  filtering: Filtering
) {
  if (filtering && filtering.title && filtering.title.trim() !== '') {
    query = query
      .textSearch('title', filtering.title, {
        config: 'english',
        type: 'plain',
      })
      .gt('similarity', 0.3);
  }
  if (filtering.efforts && filtering.efforts.length > 0) {
    query = query.in('effort', filtering.efforts);
  }
  if (filtering.difficulties && filtering.difficulties.length > 0) {
    query = query.in('difficulty', filtering.difficulties);
  }
  if (filtering.visibility) {
    query = query.eq('visibility', filtering.visibility);
  }

  if (filtering.hidx) {
    query = query.gte('hidx', filtering.hidx[0]).lte('hidx', filtering.hidx[1]);
  }
  if (filtering.kcal) {
    query = query.gte('kcal', filtering.kcal[0]).lte('kcal', filtering.kcal[1]);
  }
  if (filtering.price) {
    query = query
      .gte('price', filtering.price[0])
      .lte('price', filtering.price[1]);
  }
  return query;
}
