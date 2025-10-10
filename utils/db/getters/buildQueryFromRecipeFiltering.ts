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
  if (filtering.tags && filtering.tags.length > 0) {
    query = query.in('recipe_tags.tag_id', filtering.tags);
  }
  const [[hmin, hmax], [kmin, kmax], [pmin, pmax]] = [
    filtering.hidx,
    filtering.kcal,
    filtering.price,
  ];

  query = query
    .gte('hidx', hmin)
    .lte('hidx', hmax)
    .gte('kcal', kmin)
    .lte('kcal', kmax)
    .gte('price', pmin)
    .lte('price', pmax);
  return query;
}
