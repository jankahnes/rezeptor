import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export default function buildQuery(
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  opts: GetterOpts = {}
) {
  if (opts.eq) {
    for (const [key, value] of Object.entries(opts.eq)) {
      query = query.eq(key, value);
    }
  }

  if (opts.limit) {
    query = query.limit(opts.limit);
  }

  if (opts.orderBy) {
    query = query.order(opts.orderBy.column, {
      ascending: opts.orderBy.ascending ?? true,
    });
  }

  if (opts.in) {
    for (const [key, value] of Object.entries(opts.in)) {
      query = query.in(key, value);
    }
  }

  if (opts.not) {
    for (const [key, value] of Object.entries(opts.not)) {
      query = query.not(key, 'is', value);
    }
  }

  if (opts.search) {
    query = query
      .textSearch(opts.search.column, opts.search.query, {
        config: 'english',
        type: 'plain',
      })
      .gt('similarity', 0.3);
  }

  return query;
}
